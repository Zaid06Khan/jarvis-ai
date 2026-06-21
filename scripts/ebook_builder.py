#!/usr/bin/env python3
"""Jarvis reusable ebook/PDF builder.

Turns a Markdown file into a clean, professional PDF with an auto-generated cover.
Use this for every ebook/PDF instead of hand-rolling one (the old ad-hoc method dropped
tables, flattened bold, and escaped '&' -> 'P&L;').

Usage:
  python ebook_builder.py --md book.md --title "My Title" --out book.pdf \
      [--subtitle "..."] [--cover-prompt "..."] [--cover path.png] [--no-cover]

Notes:
  - Renders with markdown + xhtml2pdf + DejaVu fonts (so checkmarks/box glyphs render).
  - Cover is generated via the OpenAI images API (gpt-image-2 by default, portrait 1024x1536)
    unless --cover is given or --no-cover is set.
  - Prints the REAL page count and WARNS if the PDF exceeds 70 pages (the house cap).
"""
import argparse
import base64
import os

import httpx
import markdown
from dotenv import load_dotenv
from xhtml2pdf import pisa

load_dotenv("/opt/edvisingu/.env")

DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
DEJAVU_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MAX_PAGES = 70


def generate_cover(title, out_png, prompt=None):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("! OPENAI_API_KEY not set — skipping cover")
        return None
    model = os.getenv("IMAGE_MODEL", "gpt-image-2")
    prompt = prompt or (
        f"Professional premium ebook cover, portrait orientation. Large bold title text \"{title}\" near the top. "
        "Modern clean design, deep navy and emerald green palette, subtle minimal iconography, elegant high-end "
        "typography, lots of negative space, premium look.")
    r = httpx.post("https://api.openai.com/v1/images/generations",
                   headers={"Authorization": f"Bearer {key}"},
                   json={"model": model, "prompt": prompt, "size": "1024x1536", "n": 1}, timeout=200)
    if r.status_code != 200:
        print("! cover generation failed:", r.text[:200])
        return None
    d = r.json()["data"][0]
    img = base64.b64decode(d["b64_json"]) if d.get("b64_json") else httpx.get(d["url"], timeout=120).content
    with open(out_png, "wb") as f:
        f.write(img)
    print(f"cover generated: {out_png} ({len(img)} bytes)")
    return out_png


def build_html(md_text, cover_path=None):
    body = markdown.markdown(md_text, extensions=["tables", "fenced_code", "sane_lists"])
    font_face, font_family = "", "Helvetica"
    if os.path.exists(DEJAVU):
        font_face = (f"@font-face {{ font-family: 'DejaVu'; src: url('{DEJAVU}'); }}"
                     f"@font-face {{ font-family: 'DejaVu'; font-weight: bold; src: url('{DEJAVU_B}'); }}")
        font_family = "DejaVu"
    css = f"""
    {font_face}
    @page {{ size: letter; margin: 0.9in 0.85in; }}
    body {{ font-family: {font_family}, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.42; color: #1b1b1b; }}
    .cover {{ text-align: center; page-break-after: always; }}
    .cover img {{ width: 510px; }}
    h1 {{ font-size: 23pt; color: #0f2c4a; margin: 0 0 4px 0; }}
    h2 {{ font-size: 16pt; color: #0f6b3f; page-break-before: always; border-bottom: 2px solid #0f6b3f; padding-bottom: 3px; margin: 0 0 8px 0; }}
    h3 {{ font-size: 12.5pt; color: #0f2c4a; margin: 12px 0 4px 0; }}
    p {{ margin: 5px 0; }} ul, ol {{ margin: 5px 0 5px 16px; }} li {{ margin: 2px 0; }}
    strong {{ color: #0f2c4a; }}
    table {{ border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 9pt; }}
    th {{ background-color: #0f2c4a; color: #fff; padding: 5px 6px; text-align: left; }}
    td {{ border: 1px solid #ccc; padding: 5px 6px; }}
    pre {{ background-color: #f3f4f6; border: 1px solid #e2e4e8; padding: 7px; font-family: Courier, monospace; font-size: 8.5pt; }}
    code {{ font-family: Courier, monospace; font-size: 9pt; }}
    hr {{ border: none; border-top: 1px solid #d9d9d9; margin: 10px 0; }}
    """
    cover_div = f"<div class='cover'><img src='{cover_path}'/></div>" if cover_path else ""
    return (f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>"
            f"{cover_div}<div class='content'>{body}</div></body></html>")


def page_count(pdf_path):
    try:
        from pypdf import PdfReader
        return len(PdfReader(pdf_path).pages)
    except Exception:
        return None


def build(md_path, out_pdf, title, subtitle=None, cover_prompt=None, cover=None, no_cover=False):
    cover_path = cover
    if not no_cover and not cover:
        cover_path = os.path.splitext(out_pdf)[0] + "_cover.png"
        cover_path = generate_cover(title, cover_path, cover_prompt)
    md_text = open(md_path, encoding="utf-8").read()
    html = build_html(md_text, cover_path if (cover_path and os.path.exists(cover_path)) else None)
    with open(out_pdf, "wb") as f:
        result = pisa.CreatePDF(html, dest=f, encoding="utf-8")
    pages = page_count(out_pdf)
    print(f"PDF built: {out_pdf} ({os.path.getsize(out_pdf)} bytes) | pages: {pages} | errors: {result.err}")
    if pages and pages > MAX_PAGES:
        print(f"!! WARNING: {pages} pages exceeds the {MAX_PAGES}-page cap — trim the content before publishing.")
    return {"pdf": out_pdf, "cover": cover_path, "pages": pages}


def main():
    ap = argparse.ArgumentParser(description="Build a professional ebook PDF from Markdown.")
    ap.add_argument("--md", required=True, help="input markdown file")
    ap.add_argument("--out", required=True, help="output PDF path")
    ap.add_argument("--title", required=True, help="title (used for the auto cover)")
    ap.add_argument("--subtitle", default=None)
    ap.add_argument("--cover-prompt", default=None, help="override the cover image prompt")
    ap.add_argument("--cover", default=None, help="use an existing cover PNG instead of generating one")
    ap.add_argument("--no-cover", action="store_true", help="build without a cover page")
    a = ap.parse_args()
    build(a.md, a.out, a.title, a.subtitle, a.cover_prompt, a.cover, a.no_cover)


if __name__ == "__main__":
    main()
