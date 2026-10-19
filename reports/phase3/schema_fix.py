"""Put pandoc/python-docx output into strict OOXML element order so Word never needs to repair it.

Fixes (all found by validating against the OOXML schemas):
- child order inside w:style, w:pPr, w:tblPr, w:tcPr, m:dPr; w:zoom position in settings
- m:nor and m:sty together in m:rPr (schema allows one or the other)
- short w:nsid values in numbering; stray text inside w:rPr (pandoc reference quirk)
- w:pgMar missing header/footer/gutter
"""
import os
import shutil
import sys
import zipfile
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
M = "http://schemas.openxmlformats.org/officeDocument/2006/math"


def w(tag):
    return f"{{{W}}}{tag}"


ORDER = {
    w("style"): ["name", "aliases", "basedOn", "next", "link", "autoRedefine", "hidden", "uiPriority",
                 "semiHidden", "unhideWhenUsed", "qFormat", "locked", "personal", "personalCompose",
                 "personalReply", "rsid", "pPr", "rPr", "tblPr", "trPr", "tcPr", "tblStylePr"],
    w("pPr"): ["pStyle", "keepNext", "keepLines", "pageBreakBefore", "framePr", "widowControl", "numPr",
               "suppressLineNumbers", "pBdr", "shd", "tabs", "suppressAutoHyphens", "kinsoku", "wordWrap",
               "overflowPunct", "topLinePunct", "autoSpaceDE", "autoSpaceDN", "bidi", "adjustRightInd",
               "snapToGrid", "spacing", "ind", "contextualSpacing", "mirrorIndents", "suppressOverlap", "jc",
               "textDirection", "textAlignment", "textboxTightWrap", "outlineLvl", "divId", "cnfStyle",
               "rPr", "sectPr", "pPrChange"],
    w("tblPr"): ["tblStyle", "tblpPr", "tblOverlap", "bidiVisual", "tblStyleRowBandSize",
                 "tblStyleColBandSize", "tblW", "jc", "tblCellSpacing", "tblInd", "tblBorders", "shd",
                 "tblLayout", "tblCellMar", "tblLook", "tblCaption", "tblDescription", "tblPrChange"],
    w("tcPr"): ["cnfStyle", "tcW", "gridSpan", "hMerge", "vMerge", "tcBorders", "shd", "noWrap", "tcMar",
                "textDirection", "tcFitText", "vAlign", "hideMark", "headers", "cellIns", "cellDel",
                "cellMerge", "tcPrChange"],
    w("rPr"): ["rStyle", "rFonts", "b", "bCs", "i", "iCs", "caps", "smallCaps", "strike", "dstrike",
               "outline", "shadow", "emboss", "imprint", "noProof", "snapToGrid", "vanish", "webHidden",
               "color", "spacing", "w", "kern", "position", "sz", "szCs", "highlight", "u", "effect", "bdr",
               "shd", "fitText", "vertAlign", "rtl", "cs", "em", "lang", "eastAsianLayout", "specVanish",
               "oMath"],
}
SETTINGS_ORDER = """writeProtection view zoom removePersonalInformation removeDateAndTime
doNotDisplayPageBoundaries displayBackgroundShape printPostScriptOverText printFractionalCharacterWidth
printFormsData embedTrueTypeFonts embedSystemFonts saveSubsetFonts saveFormsData mirrorMargins
alignBordersAndEdges bordersDoNotSurroundHeader bordersDoNotSurroundFooter gutterAtTop hideSpellingErrors
hideGrammaticalErrors activeWritingStyle proofState formsDesign attachedTemplate linkStyles
stylePaneFormatFilter stylePaneSortMethod documentType mailMerge revisionView trackRevisions doNotTrackMoves
doNotTrackFormatting documentProtection autoFormatOverride styleLockTheme styleLockQFSet defaultTabStop
autoHyphenation consecutiveHyphenLimit hyphenationZone doNotHyphenateCaps showEnvelope summaryLength
clickAndTypeStyle defaultTableStyle evenAndOddHeaders bookFoldRevPrinting bookFoldPrinting
bookFoldPrintingSheets drawingGridHorizontalSpacing drawingGridVerticalSpacing
displayHorizontalDrawingGridEvery displayVerticalDrawingGridEvery doNotUseMarginsForDrawingGridOrigin
drawingGridHorizontalOrigin drawingGridVerticalOrigin doNotShadeFormData noPunctuationKerning
characterSpacingControl printTwoOnOne strictFirstAndLastChars noLineBreaksAfter noLineBreaksBefore
savePreviewPicture doNotValidateAgainstSchema saveInvalidXml ignoreMixedContent alwaysShowPlaceholderText
doNotDemarcateInvalidXml saveXmlDataOnly useXSLTWhenSaving saveThroughXslt showXMLTags
alwaysMergeEmptyNamespace updateFields hdrShapeDefaults footnotePr endnotePr compat docVars rsids mathPr
attachedSchema themeFontLang clrSchemeMapping doNotIncludeSubdocsInStats doNotAutoCompressPictures
forceUpgrade captions readModeInkLockDown smartTagType schemaLibrary shapeDefaults doNotEmbedSmartTags
decimalSymbol listSeparator""".split()
M_DPR = ["begChr", "sepChr", "endChr", "grow", "shp", "ctrlPr"]


def reorder(el, names, ns=W):
    rank = {f"{{{ns}}}{n}": i for i, n in enumerate(names)}
    kids = list(el)
    if not all(k.tag in rank for k in kids if isinstance(k.tag, str)):
        return  # unknown child (e.g. extension); leave untouched
    srt = sorted(kids, key=lambda k: rank.get(k.tag, 999))
    if srt != kids:
        for k in kids:
            el.remove(k)
        for k in srt:
            el.append(k)


def fix_tree(root, name):
    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        if el.tag in ORDER:
            if el.tag == w("rPr") and el.text and el.text.strip():
                el.text = None
            for k in el:
                if k.tail and k.tail.strip():
                    k.tail = None
            # pPr inside a paragraph-mark rPr etc. share names; only reorder known parents
            reorder(el, ORDER[el.tag])
        elif el.tag == f"{{{M}}}dPr":
            reorder(el, M_DPR, ns=M)
        elif el.tag == f"{{{M}}}rPr":
            nor = el.find(f"{{{M}}}nor")
            sty = el.find(f"{{{M}}}sty")
            if nor is not None and sty is not None:
                el.remove(sty)
        elif el.tag == w("nsid"):
            v = el.get(w("val"))
            if v and len(v) < 8:
                el.set(w("val"), v.rjust(8, "0"))
        elif el.tag == w("pgMar"):
            for a, d in (("header", "708"), ("footer", "708"), ("gutter", "0")):
                if el.get(w(a)) is None:
                    el.set(w(a), d)
    if name == "settings.xml":
        seq = SETTINGS_ORDER
        rank = {n: i for i, n in enumerate(seq)}
        kids = [k for k in root if isinstance(k.tag, str)]
        local = [etree.QName(k).localname for k in kids]
        if all(n in rank for n in local):
            for k in kids:
                root.remove(k)
            for k in sorted(kids, key=lambda k: rank[etree.QName(k).localname]):
                root.append(k)
        else:
            print("settings: unknown children, left as is:", [n for n in local if n not in rank])


def main(path):
    tmp = path + ".dir"
    shutil.rmtree(tmp, ignore_errors=True)
    with zipfile.ZipFile(path) as z:
        z.extractall(tmp)
        names = z.namelist()
    for rel in ("word/document.xml", "word/styles.xml", "word/numbering.xml", "word/settings.xml"):
        p = os.path.join(tmp, rel)
        if not os.path.exists(p):
            continue
        tree = etree.parse(p)
        fix_tree(tree.getroot(), os.path.basename(rel))
        tree.write(p, xml_declaration=True, encoding="UTF-8", standalone=True)
    os.remove(path)
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        # [Content_Types].xml first, as Word expects
        for n in sorted(names, key=lambda n: (n != "[Content_Types].xml", n)):
            z.write(os.path.join(tmp, n), n)
    shutil.rmtree(tmp)


if __name__ == "__main__":
    main(sys.argv[1])
    print("fixed", sys.argv[1])
