from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
FONT = Path("/Users/tsvetomiramashova/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/fonts/DejaVuSans.ttf")

TOOLKITS = [
    ("low-waste-home-toolkit", "Low-Waste Home", "Дом с по-малко отпадъци", ["Map one week of household waste", "Choose prevention before recycling", "Create a repair and reuse station", "Review progress after seven days"], ["Опишете отпадъците за една седмица", "Изберете предотвратяване преди рециклиране", "Създайте място за ремонт и повторна употреба", "Прегледайте напредъка след седем дни"]),
    ("home-energy-checkup", "Home Energy Check-up", "Домашна енергийна проверка", ["Check heating and cooling settings", "Find standby loads", "Inspect drafts and shading", "Record a monthly baseline"], ["Проверете отоплението и охлаждането", "Открийте уреди в режим на готовност", "Проверете теченията и засенчването", "Запишете месечна базова стойност"]),
    ("sustainable-food-planner", "Sustainable Food Planner", "Планер за устойчива храна", ["Plan meals around what you have", "Store food by use-by priority", "Choose a plant-rich meal", "Measure avoidable waste"], ["Планирайте с наличната храна", "Подредете храната по срок", "Изберете растително хранене", "Измерете предотвратимия отпадък"]),
    ("community-climate-workshop", "Community Climate Workshop", "Общностна климатична работилница", ["Define the local challenge", "Map who is affected", "Compare evidence-backed options", "Assign one measurable next step"], ["Определете местното предизвикателство", "Картографирайте засегнатите хора", "Сравнете решения с доказателства", "Определете измерима следваща стъпка"]),
    ("water-stewardship-audit", "Water Stewardship Audit", "Проверка за грижа за водата", ["Check visible leaks", "Observe outdoor runoff", "Protect water quality", "Track one improvement"], ["Проверете видимите течове", "Наблюдавайте повърхностния отток", "Пазете качеството на водата", "Проследете едно подобрение"]),
    ("teacher-learning-pack", "Teacher Learning Pack", "Учителски образователен пакет", ["Start with a source question", "Use an accessible activity", "Invite reflection without shame", "Connect learning to community action"], ["Започнете с въпрос към източник", "Използвайте достъпна дейност", "Насърчете размисъл без обвинение", "Свържете ученето с общностно действие"]),
]


def build_pdf(filename, title_en, title_bg, steps_en, steps_bg):
    path = OUTPUT / f"{filename}.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=22 * mm, leftMargin=22 * mm, topMargin=18 * mm, bottomMargin=18 * mm, title=title_en, author="Green Compass Editorial Team")
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="GCDisplay", parent=styles["Title"], fontName="DejaVu", fontSize=25, leading=31, textColor=colors.HexColor("#174C35"), spaceAfter=10))
    styles.add(ParagraphStyle(name="GCHeading", parent=styles["Heading2"], fontName="DejaVu", fontSize=16, leading=21, textColor=colors.HexColor("#174C35"), spaceBefore=12, spaceAfter=7))
    styles.add(ParagraphStyle(name="GCBody", parent=styles["BodyText"], fontName="DejaVu", fontSize=10.5, leading=16, textColor=colors.HexColor("#24352B")))
    styles.add(ParagraphStyle(name="GCFooter", parent=styles["BodyText"], fontName="DejaVu", fontSize=8, leading=11, textColor=colors.HexColor("#5B6B61"), alignment=TA_CENTER))

    def page(canvas, document):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#174C35"))
        canvas.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, fill=1, stroke=0)
        canvas.setFont("DejaVu", 8)
        canvas.setFillColor(colors.HexColor("#5B6B61"))
        canvas.drawCentredString(A4[0] / 2, 9 * mm, f"Green Compass Knowledge Hub  |  {document.page}")
        canvas.restoreState()

    story = [Paragraph("GREEN COMPASS KNOWLEDGE HUB", styles["GCFooter"]), Spacer(1, 8 * mm), Paragraph(title_en, styles["GCDisplay"]), Paragraph("A practical, source-aware worksheet for turning learning into one measurable action.", styles["GCBody"]), Spacer(1, 7 * mm)]
    rows = [[Paragraph("Step", styles["GCBody"]), Paragraph("Action", styles["GCBody"]), Paragraph("My note", styles["GCBody"])]]
    for index, step in enumerate(steps_en, 1):
        rows.append([Paragraph(str(index), styles["GCBody"]), Paragraph(step, styles["GCBody"]), Paragraph("________________________________", styles["GCBody"])])
    table = Table(rows, colWidths=[22 * mm, 67 * mm, 70 * mm], rowHeights=[10 * mm] + [22 * mm] * len(steps_en))
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCEDE2")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B9C9BC")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7)]))
    story += [table, Spacer(1, 8 * mm), Paragraph("Reflection", styles["GCHeading"]), Paragraph("What changed? What evidence did you notice? What will you repeat or adjust next week?", styles["GCBody"]), Spacer(1, 18 * mm), Paragraph("Sources and safety", styles["GCHeading"]), Paragraph("Use this pack with the cited Knowledge Hub lesson. Follow local guidance and product safety instructions. This worksheet is educational and does not replace professional advice.", styles["GCBody"]), PageBreak(), Paragraph("GREEN COMPASS KNOWLEDGE HUB", styles["GCFooter"]), Spacer(1, 8 * mm), Paragraph(title_bg, styles["GCDisplay"]), Paragraph("Практичен работен лист, който превръща наученото в едно измеримо действие.", styles["GCBody"]), Spacer(1, 7 * mm)]
    rows_bg = [[Paragraph("Стъпка", styles["GCBody"]), Paragraph("Действие", styles["GCBody"]), Paragraph("Моята бележка", styles["GCBody"])]]
    for index, step in enumerate(steps_bg, 1):
        rows_bg.append([Paragraph(str(index), styles["GCBody"]), Paragraph(step, styles["GCBody"]), Paragraph("________________________________", styles["GCBody"])])
    table_bg = Table(rows_bg, colWidths=[22 * mm, 67 * mm, 70 * mm], rowHeights=[10 * mm] + [22 * mm] * len(steps_bg))
    table_bg.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCEDE2")), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#B9C9BC")), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7)]))
    story += [table_bg, Spacer(1, 8 * mm), Paragraph("Размисъл", styles["GCHeading"]), Paragraph("Какво се промени? Какви доказателства забелязахте? Какво ще повторите или коригирате следващата седмица?", styles["GCBody"]), Spacer(1, 18 * mm), Paragraph("Източници и безопасност", styles["GCHeading"]), Paragraph("Използвайте пакета със свързания урок и неговите източници. Следвайте местните правила и инструкциите за безопасност. Материалът е образователен и не заменя професионален съвет.", styles["GCBody"])]
    doc.build(story, onFirstPage=page, onLaterPages=page)
    return path


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    pdfmetrics.registerFont(TTFont("DejaVu", str(FONT)))
    for toolkit in TOOLKITS:
        print(build_pdf(*toolkit))


if __name__ == "__main__":
    main()
