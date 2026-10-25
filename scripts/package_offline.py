#!/usr/bin/env python3
"""Package the single-file offline app and all public media into a portable ZIP."""
import json
import shutil
import zipfile
from pathlib import Path

root = Path.cwd()
build = root / 'dist-offline'
public = root / 'public'
output = public / 'downloads' / 'TERRA-Offline.zip'
catalog = json.loads((root / 'src/data/full-catalog.json').read_text())
assert (build / 'index.html').exists(), 'Run the offline Vite build first'

for name in ('images', 'icons'):
    source = public / name
    if source.exists():
        shutil.copytree(source, build / name, dirs_exist_ok=True)
for name in ('favicon.svg', 'manifest.webmanifest'):
    source = public / name
    if source.exists():
        shutil.copy2(source, build / name)
attribution = root / 'src/data/ATTRIBUTION.md'
if attribution.exists():
    shutil.copy2(attribution, build / 'ATTRIBUTION.md')

meta = catalog['meta']
(build / 'ПРОЧТИ МЕНЯ.txt').write_text(f'''TERRA ЛЕТОПИСЬ — ПОЛНАЯ ОФЛАЙН-ВЕРСИЯ
======================================
Terraria {meta['gameVersion']} · данные {meta['dataVersion']}
{meta['itemCount']} предметов · {meta['recipeCount']} рецептов

ЗАПУСК
1. Полностью распакуй архив в обычную папку.
2. Открой index.html двойным кликом.
3. Node.js, Python, сервер и интернет НЕ нужны.

Все крафты, деревья рецептов, поиск, источники, NPC, рюкзак,
прохождение и дневник работают локально. Спрайты, GIF и шрифты
находятся внутри архива. Ссылки на Wiki требуют интернет.

Рюкзак, прогресс и дневник сохраняются в браузере. Перед переносом
или обновлением открой «Офлайн» → «Экспорт JSON», затем импортируй
файл в новой версии. Не удаляйте папку images рядом с index.html.

Неофициальный фанатский проект. Terraria © Re-Logic.
Данные и изображения: Official Terraria Wiki / Doeschi,
CC BY-NC-SA 4.0. Подробности — в исходном репозитории.
''', encoding='utf-8')

output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(build.rglob('*')):
        if path.is_file():
            archive.write(path, Path('TERRA-Offline') / path.relative_to(build))

with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert 'TERRA-Offline/index.html' in archive.namelist()
    assert any(name.startswith('TERRA-Offline/images/sprites/') for name in archive.namelist())
print(f'Offline package: {output} · {output.stat().st_size:,} bytes · {len(archive.namelist())} files')
