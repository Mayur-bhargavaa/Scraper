from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Flowable
 
W, H = A4
 
# ── B&W Colors only ──────────────────────────────────────────────────────────
C_BLACK     = colors.HexColor("#000000")
C_DARK      = colors.HexColor("#111111")
C_DARK2     = colors.HexColor("#222222")
C_MID       = colors.HexColor("#555555")
C_GRAY      = colors.HexColor("#888888")
C_LIGHT     = colors.HexColor("#CCCCCC")
C_LIGHTER   = colors.HexColor("#E8E8E8")
C_LIGHTEST  = colors.HexColor("#F5F5F5")
C_WHITE     = colors.white
 
# ── Styles ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()
 
def S(name, **kw):
    return ParagraphStyle(name, **kw)
 
section_head = S("sec_head", fontSize=16, textColor=C_DARK, leading=22,
                 fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=4)
body         = S("body", fontSize=9.5, textColor=C_DARK2, leading=14,
                 fontName="Helvetica", spaceAfter=4)
bold_body    = S("bold_body", fontSize=10, textColor=C_DARK, leading=14,
                 fontName="Helvetica-Bold")
small_gray   = S("small_gray", fontSize=8.5, textColor=C_GRAY, leading=12,
                 fontName="Helvetica")
table_head   = S("tbl_head", fontSize=9, textColor=C_WHITE, leading=12,
                 fontName="Helvetica-Bold", alignment=TA_CENTER)
table_cell   = S("tbl_cell", fontSize=9, textColor=C_DARK2, leading=13,
                 fontName="Helvetica")
table_cell_c = S("tbl_cell_c", fontSize=9, textColor=C_DARK2, leading=13,
                 fontName="Helvetica", alignment=TA_CENTER)
table_bold   = S("tbl_bold", fontSize=9, textColor=C_DARK, leading=13,
                 fontName="Helvetica-Bold")
caption_formula = S("cap_f", fontSize=9, textColor=C_MID, leading=13,
                    fontName="Helvetica-Oblique")
footer_s     = S("footer_s", fontSize=8, textColor=C_GRAY, alignment=TA_CENTER)
 
# ── Custom Flowables ──────────────────────────────────────────────────────────
class CoverPage(Flowable):
    def wrap(self, aw, ah): return aw, 200*mm
    def draw(self):
        c = self.canv
        w = 174*mm
 
        # Solid black header bar
        c.setFillColor(C_BLACK)
        c.rect(0, 182*mm, w, 18*mm, fill=1, stroke=0)
 
        # Top label
        c.setFillColor(C_WHITE)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(4*mm, 187*mm, "SOCIAL MEDIA STRATEGY DOCUMENT")
 
        # Main title
        c.setFillColor(C_BLACK)
        c.setFont("Helvetica-Bold", 34)
        c.drawString(0, 153*mm, "Social Media")
        c.drawString(0, 133*mm, "Launch Plan")
 
        # Subtitle line
        c.setFillColor(C_DARK)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(0, 122*mm, "Fashion & Lifestyle Brand")
 
        # Thick rule
        c.setStrokeColor(C_BLACK)
        c.setLineWidth(2)
        c.line(0, 118*mm, 60*mm, 118*mm)
 
        # Descriptor line
        c.setFillColor(C_MID)
        c.setFont("Helvetica", 9.5)
        c.drawString(0, 111*mm, "3-Phase Content Strategy  \u2022  Pre-Launch to Post-Launch")
        c.drawString(0, 105*mm, "3\u20134 Posts/Week  \u2022  Instagram \u00b7 Facebook \u00b7 YouTube \u00b7 Pinterest \u00b7 X")
 
        # Info badges (outlined boxes)
        badges = ["Fashion / Lifestyle", "All Platforms", "Product Launch"]
        bx = 0
        for txt in badges:
            bw = 44*mm
            c.setFillColor(C_LIGHTEST)
            c.setStrokeColor(C_LIGHT)
            c.setLineWidth(0.5)
            c.rect(bx, 92*mm, bw - 2*mm, 8*mm, fill=1, stroke=1)
            c.setFillColor(C_DARK)
            c.setFont("Helvetica-Bold", 8)
            c.drawCentredString(bx + (bw - 2*mm)/2, 94.8*mm, txt)
            bx += bw
 
        # Divider
        c.setStrokeColor(C_LIGHT)
        c.setLineWidth(0.5)
        c.line(0, 88*mm, w, 88*mm)
 
        # Bottom note
        c.setFillColor(C_GRAY)
        c.setFont("Helvetica", 8)
        c.drawString(0, 20*mm, "PREPARED FOR CLIENT REVIEW")
        c.setFillColor(C_DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(0, 13*mm, "Confidential \u2014 Not for distribution")
 
 
class PhaseHeader(Flowable):
    def __init__(self, phase_num, title, duration, fill=C_BLACK):
        self.phase_num = phase_num
        self.title = title
        self.duration = duration
        self.fill = fill
    def wrap(self, aw, ah): return aw, 17*mm
    def draw(self):
        c = self.canv
        w = 174*mm
        c.setFillColor(self.fill)
        c.rect(0, 1*mm, w, 15*mm, fill=1, stroke=0)
        # Phase number box (slightly lighter)
        c.setFillColor(C_DARK2)
        c.rect(0, 1*mm, 17*mm, 15*mm, fill=1, stroke=0)
        c.setFillColor(C_WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(8.5*mm, 6*mm, self.phase_num)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(20*mm, 9*mm, self.title)
        c.setFont("Helvetica", 8.5)
        c.setFillColor(colors.HexColor("#AAAAAA"))
        c.drawString(20*mm, 3.5*mm, self.duration)
 
 
class TaggedRow(Flowable):
    def __init__(self, tag, title, desc, platforms):
        self.tag = tag
        self.title = title
        self.desc = desc
        self.platforms = platforms
    def wrap(self, aw, ah):
        self._aw = aw
        return aw, 35*mm
    def draw(self):
        c = self.canv
        w = self._aw
        # Card outline
        c.setFillColor(C_WHITE)
        c.setStrokeColor(C_LIGHT)
        c.setLineWidth(0.5)
        c.rect(0, 0, w, 33*mm, fill=1, stroke=1)
        # Left accent bar (black)
        c.setFillColor(C_BLACK)
        c.rect(0, 0, 2.5, 33*mm, fill=1, stroke=0)
        # Tag pill
        c.setFillColor(C_DARK)
        c.roundRect(7*mm, 26.5*mm, 24*mm, 5*mm, 2, fill=1, stroke=0)
        c.setFillColor(C_WHITE)
        c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(19*mm, 28.2*mm, self.tag)
        # Title
        c.setFillColor(C_BLACK)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(7*mm, 21.5*mm, self.title)
        # Description wrapped
        c.setFillColor(C_MID)
        c.setFont("Helvetica", 8.5)
        words = self.desc.split()
        line, lines = [], []
        for word in words:
            test = " ".join(line + [word])
            if c.stringWidth(test, "Helvetica", 8.5) < (w - 14*mm):
                line.append(word)
            else:
                lines.append(" ".join(line))
                line = [word]
        if line: lines.append(" ".join(line))
        y = 17.5*mm
        for ln in lines[:3]:
            c.drawString(7*mm, y, ln)
            y -= 4*mm
        # Platform pills
        px = 7*mm
        for plat in self.platforms:
            pw = c.stringWidth(plat, "Helvetica", 7.5) + 5*mm
            c.setFillColor(C_LIGHTEST)
            c.setStrokeColor(C_LIGHT)
            c.setLineWidth(0.5)
            c.roundRect(px, 1.5*mm, pw, 4*mm, 1.5, fill=1, stroke=1)
            c.setFillColor(C_MID)
            c.setFont("Helvetica", 7.5)
            c.drawString(px + 2.5*mm, 2.7*mm, plat)
            px += pw + 2*mm
 
 
# ── Build document ────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    "social_media_launch_plan_bw.pdf",
    pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm,
    topMargin=14*mm, bottomMargin=14*mm
)
 
story = []
 
# PAGE 1 — Cover
story.append(CoverPage())
story.append(Spacer(1, 4*mm))
 
# ── Executive Summary ─────────────────────────────────────────────────────────
story.append(Paragraph("Executive Summary", section_head))
story.append(HRFlowable(width="100%", thickness=1, color=C_BLACK, spaceAfter=6))
 
summary_data = [
    ["Client Type", "Fashion / Lifestyle Brand"],
    ["Goal", "New Product / Service Launch"],
    ["Platforms", "Instagram \u00b7 Facebook \u00b7 YouTube \u00b7 Pinterest \u00b7 X (Twitter)"],
    ["Posting Frequency", "3\u20134 posts per week"],
    ["Current Stage", "Pre-launch \u2014 BTS & Teaser Phase"],
    ["Plan Duration", "8 Weeks (3 Phases)"],
    ["Content Mix", "Reels, Carousels, Stories, Long-form Video, UGC"],
]
t = Table(summary_data, colWidths=[52*mm, 122*mm])
t.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (0,-1), C_LIGHTEST),
    ("BACKGROUND",     (1,0), (1,-1), C_WHITE),
    ("FONTNAME",       (0,0), (0,-1), "Helvetica-Bold"),
    ("FONTNAME",       (1,0), (1,-1), "Helvetica"),
    ("FONTSIZE",       (0,0), (-1,-1), 9.5),
    ("TEXTCOLOR",      (0,0), (-1,-1), C_DARK),
    ("ROWBACKGROUNDS", (0,0), (-1,-1), [C_LIGHTEST, C_WHITE]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 6),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 6),
    ("LEFTPADDING",    (0,0), (-1,-1), 8),
]))
story.append(t)
story.append(Spacer(1, 6*mm))
 
story.append(Paragraph("Objective", bold_body))
story.append(Paragraph(
    "This plan outlines a structured 3-phase social media strategy to successfully launch a new fashion product. "
    "The strategy builds anticipation before launch, creates maximum impact during launch week, "
    "and sustains momentum after launch to drive ongoing sales and brand awareness across all platforms.",
    body))
story.append(Spacer(1, 5*mm))
 
story.append(Paragraph("Phase Overview", bold_body))
story.append(Spacer(1, 2*mm))
 
phases_overview = [
    [Paragraph("Phase", table_head), Paragraph("Name", table_head),
     Paragraph("Duration", table_head), Paragraph("Focus", table_head), Paragraph("Posts", table_head)],
    [Paragraph("1", table_cell_c), Paragraph("Pre-Launch", table_cell),
     Paragraph("Weeks 1\u20133", table_cell), Paragraph("Build hype & awareness", table_cell), Paragraph("3\u20134/week", table_cell_c)],
    [Paragraph("2", table_cell_c), Paragraph("Launch Week", table_cell),
     Paragraph("Week 4", table_cell), Paragraph("Maximum impact & visibility", table_cell), Paragraph("Daily", table_cell_c)],
    [Paragraph("3", table_cell_c), Paragraph("Post-Launch", table_cell),
     Paragraph("Weeks 5\u20138", table_cell), Paragraph("Sustain momentum & conversions", table_cell), Paragraph("3\u20134/week", table_cell_c)],
]
pt = Table(phases_overview, colWidths=[15*mm, 33*mm, 28*mm, 74*mm, 24*mm])
pt.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("ALIGN",          (0,0), (-1,-1), "CENTER"),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 7),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 7),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
    ("FONTNAME",       (0,1), (0,-1), "Helvetica-Bold"),
]))
story.append(pt)
 
# ── Phase 1 ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 8*mm))
story.append(PhaseHeader("1", "Pre-Launch \u2014 Build Hype & Awareness", "Weeks 1\u20133  \u2022  3\u20134 posts/week"))
story.append(Spacer(1, 3*mm))
story.append(Paragraph(
    "The pre-launch phase is about creating curiosity and emotional investment before the product is revealed. "
    "Every post should make the audience feel like they are part of something exclusive.",
    body))
story.append(Spacer(1, 3*mm))
 
phase1_content = [
    ("REEL",     "BTS Reel \u2014 Product Creation Process",
     "Show raw behind-the-scenes: fabric selection, stitching, design sketches. Keep it aesthetic with trending audio. No voiceover needed.",
     ["Instagram", "YouTube Shorts", "Facebook"]),
    ("CAROUSEL", "Mood Board Carousel \u2014 \u2018Something New is Coming\u2019",
     "5\u20137 slides of aesthetic inspiration: color palette, textures, lifestyle shots. Last slide = countdown or date reveal. Great for saves.",
     ["Instagram", "Pinterest"]),
    ("STORIES",  "Interactive Polls \u2014 \u2018Which Style Do You Prefer?\u2019",
     "A vs B silhouettes, color choices, name votes. Makes audience feel involved and builds pre-launch buzz.",
     ["Instagram Stories", "Facebook Stories"]),
    ("REEL",     "\u2018Coming Soon\u2019 Teaser \u2014 Product Silhouette Reveal",
     "Blurred or partially covered product with dramatic reveal effect. Text overlay with launch date. 7\u201310 seconds max.",
     ["Instagram", "YouTube Shorts"]),
    ("COLLAB",   "Influencer Sneak-Peek Story (Micro-Influencer)",
     "Send product to 2\u20133 micro-influencers (10k\u2013100k). Have them post an unboxing story or exclusive preview. Tag the brand.",
     ["Instagram", "YouTube"]),
]
for tag, title, desc, platforms in phase1_content:
    story.append(TaggedRow(tag, title, desc, platforms))
    story.append(Spacer(1, 2*mm))
 
story.append(Spacer(1, 3*mm))
story.append(Paragraph("Sample Weekly Schedule \u2014 Phase 1", bold_body))
story.append(Spacer(1, 2*mm))
 
week_data = [
    [Paragraph("Day", table_head), Paragraph("Content Type", table_head),
     Paragraph("Platform", table_head), Paragraph("Goal", table_head)],
    [Paragraph("Monday", table_cell_c), Paragraph("BTS Reel", table_cell),
     Paragraph("Instagram + Facebook", table_cell), Paragraph("Awareness", table_cell)],
    [Paragraph("Wednesday", table_cell_c), Paragraph("Mood Board Carousel", table_cell),
     Paragraph("Instagram + Pinterest", table_cell), Paragraph("Save & Share", table_cell)],
    [Paragraph("Friday", table_cell_c), Paragraph("Poll Stories", table_cell),
     Paragraph("IG + FB Stories", table_cell), Paragraph("Engagement", table_cell)],
    [Paragraph("Saturday", table_cell_c), Paragraph("Teaser Reel", table_cell),
     Paragraph("Instagram + YT Shorts", table_cell), Paragraph("Hype Building", table_cell)],
]
wt = Table(week_data, colWidths=[30*mm, 52*mm, 52*mm, 40*mm])
wt.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 6),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 6),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
]))
story.append(wt)
 
# ── Phase 2 ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 8*mm))
story.append(PhaseHeader("2", "Launch Week \u2014 Maximum Impact & Visibility", "Week 4  \u2022  Post daily"))
story.append(Spacer(1, 3*mm))
story.append(Paragraph(
    "Launch week is the most critical period. Everything fires simultaneously across all platforms. "
    "The hero reel is the single most important asset \u2014 invest in production quality here.",
    body))
story.append(Spacer(1, 3*mm))
 
phase2_content = [
    ("REEL",    "Hero Launch Reel \u2014 Full Product Reveal",
     "High-quality model shoot or flat-lay cinematic reel. Show the full product in detail. This is the main launch content \u2014 invest in quality.",
     ["Instagram", "Facebook", "YouTube Shorts"]),
    ("GRAPHIC", "\u2018Now Live\u2019 Announcement Post",
     "Clean graphic with product image, price, and link. Use Stories + Post + Facebook post simultaneously. Pin to top of profile.",
     ["Instagram", "Facebook", "Pinterest"]),
    ("STORIES", "Launch Day Countdown Stories (3-part sequence)",
     "Story sequence: \u201812 hours to go\u2019 \u2192 \u20182 hours to go\u2019 \u2192 \u2018We\u2019re LIVE\u2019. Add link sticker to product page in last story.",
     ["Instagram Stories", "Facebook Stories"]),
    ("VIDEO",   "YouTube \u2014 Full Lookbook / Styling Video",
     "5\u201310 min video styling the product multiple ways. SEO-optimized title with purchase link in description. Builds long-term discoverability.",
     ["YouTube"]),
]
for tag, title, desc, platforms in phase2_content:
    story.append(TaggedRow(tag, title, desc, platforms))
    story.append(Spacer(1, 2*mm))
 
story.append(Spacer(1, 3*mm))
story.append(Paragraph("Launch Day Checklist", bold_body))
story.append(Spacer(1, 2*mm))
 
checklist = [
    [Paragraph("", table_head), Paragraph("Task", table_head), Paragraph("Platform", table_head)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Post hero reel at peak time (7\u20139 PM)", table_cell), Paragraph("Instagram + Facebook", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Go live for 15 min Q&A / reveal", table_cell), Paragraph("Instagram Live", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Post 3-part countdown story sequence", table_cell), Paragraph("IG + FB Stories", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Upload lookbook to YouTube", table_cell), Paragraph("YouTube", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Pin announcement post to top of profile", table_cell), Paragraph("Instagram + Facebook", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Update bio link to product page", table_cell), Paragraph("All platforms", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Share to Pinterest board", table_cell), Paragraph("Pinterest", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Post on X with launch hashtags", table_cell), Paragraph("X (Twitter)", table_cell)],
    [Paragraph("[ ]", table_cell_c), Paragraph("Reply to every comment within 2 hours", table_cell), Paragraph("All platforms", table_cell)],
]
ct = Table(checklist, colWidths=[10*mm, 112*mm, 52*mm])
ct.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 5),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 5),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
    ("TEXTCOLOR",      (0,1), (0,-1), C_GRAY),
]))
story.append(ct)
 
# ── Phase 3 ───────────────────────────────────────────────────────────────────
story.append(Spacer(1, 8*mm))
story.append(PhaseHeader("3", "Post-Launch \u2014 Sustain Momentum & Drive Conversions", "Weeks 5\u20138  \u2022  3\u20134 posts/week"))
story.append(Spacer(1, 3*mm))
story.append(Paragraph(
    "Most brands go silent after launch. This phase is where you build a competitive advantage \u2014 "
    "UGC, how-to styling content, and social proof keep the algorithm feeding and conversions coming in for weeks.",
    body))
story.append(Spacer(1, 3*mm))
 
phase3_content = [
    ("UGC",      "Customer Repost Series \u2014 Real Buyers Wearing It",
     "Reshare customer photos with permission. Add testimonial quote as text overlay. Best-performing post type for fashion brands after launch.",
     ["Instagram", "Facebook"]),
    ("REEL",     "\u2018How to Style\u2019 Reels \u2014 Outfit Combinations",
     "3 ways to wear the product. Fast-paced cuts, trending audio. Keeps product relevant after launch week. Post 1\u20132 per week.",
     ["Instagram", "YouTube Shorts"]),
    ("CAROUSEL", "Reviews & Response Carousel",
     "Screenshot real reviews and highlight key phrases. Add CTA on last slide. Builds trust and handles objections visually.",
     ["Instagram", "Pinterest"]),
    ("STORIES",  "Limited-Time Offer or Waitlist for Next Drop",
     "Create urgency: \u2018Only 20 pieces left\u2019 or \u2018Join waitlist for next drop.\u2019 Converts fence-sitters and builds email list.",
     ["Instagram Stories", "Facebook"]),
]
for tag, title, desc, platforms in phase3_content:
    story.append(TaggedRow(tag, title, desc, platforms))
    story.append(Spacer(1, 2*mm))
 
# ── Caption Formulas ──────────────────────────────────────────────────────────
story.append(Spacer(1, 8*mm))
story.append(Paragraph("Caption Formulas & Hashtag Strategy", section_head))
story.append(HRFlowable(width="100%", thickness=1, color=C_BLACK, spaceAfter=6))
 
caption_data = [
    [Paragraph("Content Type", table_head), Paragraph("Caption Formula", table_head), Paragraph("CTA", table_head)],
    [Paragraph("BTS / Teaser Reel", table_cell),
     Paragraph("\"We've been working on something. You're not ready. [Date] \u2014 mark it.\"", caption_formula),
     Paragraph("Save this post", table_cell)],
    [Paragraph("Mood Board", table_cell),
     Paragraph("\"Designed for the woman who [emotion]. Launching [date].\"", caption_formula),
     Paragraph("Save & tag a friend", table_cell)],
    [Paragraph("Poll Stories", table_cell),
     Paragraph("\"Help us decide! Which style speaks to you? Vote below.\"", caption_formula),
     Paragraph("Vote in poll", table_cell)],
    [Paragraph("Launch Day", table_cell),
     Paragraph("\"IT'S HERE. Tap the link in bio to shop. Limited pieces available.\"", caption_formula),
     Paragraph("Link in bio", table_cell)],
    [Paragraph("Customer UGC", table_cell),
     Paragraph("\"[Customer] styled her [product] like THIS. We\u2019re obsessed.\"", caption_formula),
     Paragraph("Shop the look", table_cell)],
    [Paragraph("How-to-Style", table_cell),
     Paragraph("\"3 ways to wear [product]. Which look is your fav? Comment below.\"", caption_formula),
     Paragraph("Comment & engage", table_cell)],
]
capt = Table(caption_data, colWidths=[38*mm, 94*mm, 42*mm])
capt.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 7),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 7),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
]))
story.append(capt)
story.append(Spacer(1, 5*mm))
 
story.append(Paragraph("Hashtag Strategy", bold_body))
story.append(Spacer(1, 2*mm))
 
hashtag_data = [
    [Paragraph("Type", table_head), Paragraph("Examples", table_head),
     Paragraph("Volume", table_head), Paragraph("Usage", table_head)],
    [Paragraph("Brand hashtag", table_cell),
     Paragraph("#[YourBrand]  #[ProductName]", table_cell),
     Paragraph("Custom", table_cell), Paragraph("Always include", table_cell)],
    [Paragraph("Niche fashion", table_cell),
     Paragraph("#IndianFashion  #StyleBlogger  #OOTDIndia", table_cell),
     Paragraph("100k\u20131M", table_cell), Paragraph("5\u20138 tags", table_cell)],
    [Paragraph("Broad reach", table_cell),
     Paragraph("#Fashion  #OOTD  #Style  #NewCollection", table_cell),
     Paragraph("1M+", table_cell), Paragraph("3\u20135 tags", table_cell)],
    [Paragraph("Launch specific", table_cell),
     Paragraph("#NewLaunch  #NewDrop  #ComingSoon", table_cell),
     Paragraph("50k\u2013500k", table_cell), Paragraph("3\u20134 tags", table_cell)],
]
ht = Table(hashtag_data, colWidths=[38*mm, 74*mm, 28*mm, 34*mm])
ht.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 6),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 6),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
    ("FONTSIZE",       (0,1), (-1,-1), 9),
]))
story.append(ht)
 
 
story.append(Spacer(1, 5*mm))
story.append(Paragraph("Platform-Specific Best Practices", bold_body))
story.append(Spacer(1, 2*mm))
 
plat_data = [
    [Paragraph("Platform", table_head), Paragraph("Best Content", table_head),
     Paragraph("Best Posting Time", table_head), Paragraph("Key Tip", table_head)],
    [Paragraph("Instagram", table_cell), Paragraph("Reels + Carousels", table_cell),
     Paragraph("7\u20139 PM daily", table_cell), Paragraph("Use all 3: Post, Stories, Reels", table_cell)],
    [Paragraph("Facebook", table_cell), Paragraph("Reels + Link posts", table_cell),
     Paragraph("1\u20134 PM weekdays", table_cell), Paragraph("Boost launch post with paid", table_cell)],
    [Paragraph("YouTube", table_cell), Paragraph("Lookbook + Shorts", table_cell),
     Paragraph("Fri\u2013Sun 2\u20135 PM", table_cell), Paragraph("SEO title & description are key", table_cell)],
    [Paragraph("Pinterest", table_cell), Paragraph("Carousel + Infographic", table_cell),
     Paragraph("8\u201311 PM evenings", table_cell), Paragraph("Long-tail keywords in pin title", table_cell)],
    [Paragraph("X (Twitter)", table_cell), Paragraph("Teasers + Announcements", table_cell),
     Paragraph("8\u201310 AM or 6\u20139 PM", table_cell), Paragraph("Use trending fashion hashtags", table_cell)],
]
plt = Table(plat_data, colWidths=[28*mm, 40*mm, 38*mm, 68*mm])
plt.setStyle(TableStyle([
    ("BACKGROUND",     (0,0), (-1,0), C_BLACK),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [C_WHITE, C_LIGHTEST]),
    ("GRID",           (0,0), (-1,-1), 0.5, C_LIGHT),
    ("VALIGN",         (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",     (0,0), (-1,-1), 6),
    ("BOTTOMPADDING",  (0,0), (-1,-1), 6),
    ("LEFTPADDING",    (0,0), (-1,-1), 6),
    ("FONTSIZE",       (0,0), (-1,-1), 9),
]))
story.append(plt)
 
# Footer
story.append(Spacer(1, 8*mm))
story.append(HRFlowable(width="100%", thickness=0.5, color=C_LIGHT))
story.append(Spacer(1, 3*mm))
story.append(Paragraph(
    "This plan is a strategic framework and may be adjusted based on content performance, audience insights, and client feedback. "
    "All targets are estimates based on industry benchmarks for fashion brands at a similar stage.",
    small_gray))
story.append(Spacer(1, 2*mm))
story.append(Paragraph("Confidential \u2014 Prepared for client review only.", footer_s))
 
doc.build(story)
print("B&W PDF created successfully.")