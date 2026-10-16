from pathlib import Path
import re
import base64
p=Path(__file__).parent
html=(p/'index.html').read_text(encoding='utf8')
css=(p/'styles.css').read_text(encoding='utf8')
# Auténtico archivo autónomo: incrusta la ilustración del estadio para que funcione sin carpeta assets.
photo=base64.b64encode((p/'assets/aficion-noveria.webp').read_bytes()).decode('ascii')
css=css.replace("./assets/aficion-noveria.webp",'data:image/webp;base64,'+photo)
data=(p/'data.js').read_text(encoding='utf8').replace('export const','const')
engine=(p/'engine.js').read_text(encoding='utf8')
app=(p/'app.js').read_text(encoding='utf8')
engine=re.sub(r'^import\s+[^;]+;\s*$', '', engine, flags=re.M)
app=re.sub(r'^import\s+[^;]+;\s*$', '', app, flags=re.M)
engine=re.sub(r'\bexport\s+(?=(const|function|class)\b)', '', engine)
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="./app.js"></script>', '<script>\n'+data+'\n'+engine+'\n'+app+'\n</script>')
html=html.replace('href="./assets/icon.svg"','href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'70\' x=\'12\' font-size=\'70\'%3E⚽%3C/text%3E%3C/svg%3E"')
html=html.replace('<link rel="manifest" href="./manifest.webmanifest">','')
(p/'NOVERIA-ABRIR.html').write_text(html,encoding='utf8')
print('Standalone compiled: ',len(html),'characters')
