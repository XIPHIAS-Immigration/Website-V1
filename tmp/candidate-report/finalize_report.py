from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter


ROOT = Path(r"E:\Website-V1")
SCRATCH = ROOT / "tmp" / "candidate-report"
BASE = SCRATCH / "mohammed-abdul-azim-base.pdf"
CUSTOM = SCRATCH / "mohammed-abdul-azim-custom.pdf"
FINAL = ROOT / "output" / "pdf" / "mohammed-abdul-azim-australia-skilled-migration-assessment.pdf"
RENDERED = SCRATCH / "rendered"


def merge_report() -> int:
    base = PdfReader(str(BASE))
    custom = PdfReader(str(CUSTOM))
    writer = PdfWriter()

    writer.add_page(base.pages[0])
    for page in custom.pages:
        writer.add_page(page)
    for index, page in enumerate(base.pages[1:], start=1):
        # The advisor-authored compact-card page repeats the expanded candidate
        # section above and cannot accommodate that detail at the template's
        # fixed type size. Keep the dedicated pages and omit the duplicate.
        if index == 3:
            continue
        writer.add_page(page)

    writer.add_metadata(
        {
            "/Title": "Mohammed Abdul Azim - Australia Skilled Migration Assessment",
            "/Author": "XIPHIAS Immigration Private Limited",
            "/Subject": "Personalised Australia subclass 189, 190 and 491 assessment",
            "/Keywords": "Australia skilled migration, subclass 189, subclass 190, subclass 491, ACS",
        }
    )
    FINAL.parent.mkdir(parents=True, exist_ok=True)
    with FINAL.open("wb") as stream:
        writer.write(stream)
    return len(writer.pages)


def render_pages() -> list[Path]:
    RENDERED.mkdir(parents=True, exist_ok=True)
    document = pdfium.PdfDocument(str(FINAL))
    paths: list[Path] = []
    for index in range(len(document)):
        image = document[index].render(scale=1.35).to_pil().convert("RGB")
        path = RENDERED / f"page-{index + 1:02d}.png"
        image.save(path, "PNG", optimize=True)
        paths.append(path)
    return paths


def contact_sheets(paths: list[Path], per_sheet: int = 12) -> list[Path]:
    outputs: list[Path] = []
    thumb_width = 290
    thumb_height = 410
    gutter = 24
    columns = 4
    rows = 3
    for group_index in range(0, len(paths), per_sheet):
        chunk = paths[group_index : group_index + per_sheet]
        canvas = Image.new(
            "RGB",
            (
                gutter + columns * (thumb_width + gutter),
                gutter + rows * (thumb_height + 38 + gutter),
            ),
            "#dce2ea",
        )
        draw = ImageDraw.Draw(canvas)
        for item_index, path in enumerate(chunk):
            image = Image.open(path).convert("RGB")
            image.thumbnail((thumb_width, thumb_height), Image.Resampling.LANCZOS)
            col = item_index % columns
            row = item_index // columns
            x = gutter + col * (thumb_width + gutter) + (thumb_width - image.width) // 2
            y = gutter + row * (thumb_height + 38 + gutter)
            canvas.paste(image, (x, y))
            page_number = group_index + item_index + 1
            draw.text((gutter + col * (thumb_width + gutter), y + thumb_height + 8), f"Page {page_number}", fill="#0a1c44")
        output = RENDERED / f"contact-{group_index // per_sheet + 1}.png"
        canvas.save(output, "PNG", optimize=True)
        outputs.append(output)
    return outputs


if __name__ == "__main__":
    page_count = merge_report()
    rendered = render_pages()
    contacts = contact_sheets(rendered)
    print(
        {
            "final": str(FINAL),
            "pages": page_count,
            "rendered": len(rendered),
            "contact_sheets": [str(path) for path in contacts],
        }
    )
