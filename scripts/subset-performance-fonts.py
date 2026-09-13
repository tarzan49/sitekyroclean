"""Run with fonttools[woff] installed; preserve original licensed Avenir files."""
from pathlib import Path
from fontTools import subset
for source in Path('public/fonts/avenir-next').glob('*.woff2'):
    if '.latin.' in source.name:
        continue
    options = subset.Options()
    options.flavor = 'woff2'
    options.hinting = False
    options.layout_features = ['kern', 'liga', 'clig']
    font = subset.load_font(str(source), options)
    glyphs = subset.Subsetter(options=options)
    glyphs.populate(unicodes=list(range(0x20, 0x100)) + [0x131, 0x152, 0x153] + list(range(0x2000, 0x2030)) + [0x20ac, 0x2122, 0x2190, 0x2192, 0x2212, 0xfeff])
    glyphs.subset(font)
    subset.save_font(font, str(source.with_name(source.stem + '.latin.woff2')), options)
