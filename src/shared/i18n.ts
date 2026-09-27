import type { Language, LanguageCode } from './types'
import { LANGUAGE_CODES } from './types'

/**
 * Every interface string, per language. English is the reference: the other
 * tables are typed against its keys, so a missing translation fails the build
 * instead of rendering a raw key. A plural entry names the Intl.PluralRules
 * categories the language uses; 'other' is always required.
 */
type Plural = { one?: string; few?: string; many?: string; other: string }
type Entry = string | Plural

const en = {
  'lang.name': 'English',

  'tip.settings': 'Settings',
  'tip.themeDark': 'Switch to dark',
  'tip.themeLight': 'Switch to light',
  'tip.power': 'Scheduled shutdown',

  'update.available': 'Update to {v}',
  'update.downloading': 'Downloading {p}%',
  'update.ready': 'Restart to update',

  'power.title': 'Shut down this PC after',
  'power.hint': 'Windows holds the timer, so it fires even if the app is closed.',
  'power.arm': 'Arm shutdown',
  'power.armed': 'Shutting down in',
  'power.cancel': 'Cancel shutdown',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clips',
  'queue.count': { one: '{n} clip', other: '{n} clips' },
  'queue.add': 'Add clips',
  'queue.clear': 'Clear',
  'queue.clearDone': 'Clear finished',

  'empty.title': 'Drop clips here',
  'empty.sub': 'or click to browse. MP4, MOV, MKV and most camera formats.',
  'empty.shortsSource': '16:9 source, up to 4K',
  'empty.shortsCrop': '9:16 crop at 1080×1920',
  'empty.premiereSource': 'Camera file, variable frame rate',
  'empty.premiereOut': 'Premiere copy, constant frame rate',

  'veil.release': { one: 'Release to add {n} clip', other: 'Release to add {n} clips' },
  'veil.generic': 'Release to add',

  'row.vfr': 'Variable fps',
  'row.vfrTip': 'Variable frame rate, the usual cause of stutter in editors. This conversion fixes it.',
  'row.remove': 'Remove from queue',
  'row.reveal': 'Show in folder',
  'row.left': '{t} left',
  'row.waiting': 'Waiting',
  'row.cancelled': 'Cancelled',
  'row.failed': 'Failed',
  'row.errNotFound': 'File not found',
  'row.errNoVideo': 'No video track in this file',
  'row.errUnreadable': 'Could not read this file',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'Edit-ready H.264',
  'preset.premiereDesc':
    'Normalises camera files so Premiere opens and scrubs them without stutter. Constant frame rate, every audio track kept.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Prep for CapCut',
  'preset.shortsDesc':
    'The whole clip, ready for a shorts editor to cut vertical in CapCut. Stays 16:9, with enough resolution for a sharp 9:16 crop.',

  'spec.codec': 'Codec',
  'spec.frameRate': 'Frame rate',
  'spec.encoder': 'Encoder',
  'spec.audio': 'Audio',
  'spec.frame': 'Frame',
  'spec.keyframes': 'Keyframes',
  'spec.madeFor': 'Made for',
  'val.h264': 'H.264, 8-bit 4:2:0',
  'val.h264High': 'H.264 High, 8-bit',
  'val.cfr': 'Constant, as source',
  'val.upTo60': 'As source, up to 60',
  'val.frame': '16:9 kept, up to 4K',
  'val.everySecond': 'Every second',
  'val.audioAll': 'AAC {k} kbps, all tracks',
  'val.audioStereo': 'AAC {k} kbps stereo',
  'val.gpu': '{name}, graphics card',
  'val.cpu': 'Processor',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Bitrate by resolution',
  'tier.res': 'Resolution',
  'tier.low': 'Up to 30 fps',
  'tier.high': '60 fps',
  'tier.inQueue': 'In your queue',

  'quality.label': 'Quality',
  'quality.hint': 'Lower keeps more detail. 18 looks identical to the source.',

  'output.label': 'Save to',
  'output.beside': 'Next to each source',
  'output.change': 'Change folder',
  'output.reset': 'Use source folders',

  'summary.in': '{size} in',
  'summary.out': 'about {size} out',

  'convert.go': 'Convert',
  'convert.progress': '{done} of {total}',
  'convert.left': '{t} left',
  'convert.cancel': 'Cancel',
  'convert.done': 'All done',
  'convert.partial': '{ok} done, {bad} failed',
  'convert.show': 'Show files',

  'ffmpeg.missing':
    'ffmpeg was not found. Reinstall the app, or place ffmpeg in C:\\ffmpeg\\bin and restart.',

  'settings.title': 'Settings',
  'settings.back': 'Back to clips',

  'sec.general': 'General',
  'set.language': 'Language',
  'set.languageHint': 'Follows Windows unless you pick one.',
  'set.languageSystem': 'System ({name})',
  'set.theme': 'Appearance',
  'set.themeSystem': 'System',
  'set.themeLight': 'Light',
  'set.themeDark': 'Dark',
  'set.motion': 'Reduce motion',
  'set.motionHint': 'Instant changes instead of animation. Independent of the Windows setting.',

  'sec.encoding': 'Encoding',
  'set.encoder': 'Encoder',
  'set.encoderAuto': 'Tested at startup, picked {name}.',
  'set.encoderForced': 'Forced. Falls back to the processor if the card refuses it.',
  'enc.auto': 'Automatic',
  'enc.cpu': 'Processor',
  'set.quality': 'Premiere quality',
  'set.audio': 'Audio bitrate',
  'set.audioHint': 'Used by both presets.',

  'sec.output': 'Output',
  'set.folder': 'Folder',

  'sec.power': 'Power',
  'set.awake': 'Keep the PC awake',
  'set.awakeHint': 'While a queue runs. Turning it off risks a cut-off file if the PC sleeps.',

  'sec.updates': 'Updates',
  'set.version': 'Version',
  'set.versionHint': 'Releases come from the project page on GitHub.',
  'set.autoCheck': 'Check on launch',
  'set.autoCheckHint': 'Only checks. Downloading is always your call.',
  'set.status': 'Status',
  'upd.idle': 'Not checked yet.',
  'upd.checking': 'Checking GitHub…',
  'upd.latest': 'You have the latest version.',
  'upd.available': 'Version {v} is available.',
  'upd.downloading': 'Downloading, {p}%.',
  'upd.ready': 'Version {v} is ready. Restart to install it.',
  'upd.error': 'The check failed. Try again, or get the installer from the releases page.',
  'upd.errNetwork': 'Could not reach GitHub. Check the connection and try again.',
  'upd.errNoRelease': 'GitHub has no release to offer yet. Try again later.',
  'upd.releases': 'Releases page',
  'upd.dev': 'Updates run only in the installed app.',
  'upd.check': 'Check now',
  'upd.download': 'Download',
  'upd.install': 'Restart and install',

  'sec.system': 'System',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'Not found',
  'set.active': 'Active encoder',
  'set.activeHint': 'What the next queue will use.',

  'dialog.pick': 'Choose clips',
  'dialog.video': 'Video',
  'dialog.output': 'Choose output folder',
} satisfies Record<string, Entry>

export type MessageKey = keyof typeof en
type Table = Record<MessageKey, Entry>

const ro: Table = {
  'lang.name': 'Română',

  'tip.settings': 'Setări',
  'tip.themeDark': 'Temă întunecată',
  'tip.themeLight': 'Temă luminoasă',
  'tip.power': 'Oprire programată',

  'update.available': 'Actualizează la {v}',
  'update.downloading': 'Se descarcă {p}%',
  'update.ready': 'Repornește pentru update',

  'power.title': 'Oprește calculatorul după',
  'power.hint': 'Windows ține cronometrul, deci se oprește chiar dacă închizi aplicația.',
  'power.arm': 'Programează oprirea',
  'power.armed': 'Se oprește în',
  'power.cancel': 'Anulează oprirea',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clipuri',
  'queue.count': { one: '{n} clip', few: '{n} clipuri', other: '{n} de clipuri' },
  'queue.add': 'Adaugă clipuri',
  'queue.clear': 'Golește',
  'queue.clearDone': 'Scoate terminatele',

  'empty.title': 'Trage clipurile aici',
  'empty.sub': 'sau apasă ca să le alegi. MP4, MOV, MKV și majoritatea formatelor de cameră.',
  'empty.shortsSource': 'Sursă 16:9, până la 4K',
  'empty.shortsCrop': 'Decupaj 9:16 la 1080×1920',
  'empty.premiereSource': 'Fișier de cameră, cadre variabile',
  'empty.premiereOut': 'Copie Premiere, cadre constante',

  'veil.release': {
    one: 'Eliberează ca să adaugi {n} clip',
    few: 'Eliberează ca să adaugi {n} clipuri',
    other: 'Eliberează ca să adaugi {n} de clipuri',
  },
  'veil.generic': 'Eliberează ca să adaugi',

  'row.vfr': 'Cadre variabile',
  'row.vfrTip': 'Frame rate variabil, cauza obișnuită a sacadărilor în editor. Conversia îl repară.',
  'row.remove': 'Scoate din listă',
  'row.reveal': 'Arată în folder',
  'row.left': 'mai are {t}',
  'row.waiting': 'În așteptare',
  'row.cancelled': 'Anulat',
  'row.failed': 'Eșuat',
  'row.errNotFound': 'Fișierul nu a fost găsit',
  'row.errNoVideo': 'Fișierul nu are pistă video',
  'row.errUnreadable': 'Fișierul nu a putut fi citit',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'H.264 gata de montaj',
  'preset.premiereDesc':
    'Normalizează fișierele de cameră ca Premiere să le deschidă și să le deruleze fără sacadări. Cadre constante, toate pistele audio păstrate.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Pregătit pentru CapCut',
  'preset.shortsDesc':
    'Clipul întreg, gata ca un editor de shorts să-l taie vertical în CapCut. Rămâne 16:9, cu destulă rezoluție pentru un decupaj 9:16 clar.',

  'spec.codec': 'Codec',
  'spec.frameRate': 'Cadre/s',
  'spec.encoder': 'Encoder',
  'spec.audio': 'Audio',
  'spec.frame': 'Cadru',
  'spec.keyframes': 'Keyframe-uri',
  'spec.madeFor': 'Pentru',
  'val.h264': 'H.264, 8 biți 4:2:0',
  'val.h264High': 'H.264 High, 8 biți',
  'val.cfr': 'Constante, ca sursa',
  'val.upTo60': 'Ca sursa, maxim 60',
  'val.frame': '16:9 păstrat, până la 4K',
  'val.everySecond': 'La fiecare secundă',
  'val.audioAll': 'AAC {k} kbps, toate pistele',
  'val.audioStereo': 'AAC {k} kbps stereo',
  'val.gpu': '{name}, placa video',
  'val.cpu': 'Procesor',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Bitrate după rezoluție',
  'tier.res': 'Rezoluție',
  'tier.low': 'Până la 30 fps',
  'tier.high': '60 fps',
  'tier.inQueue': 'În lista ta',

  'quality.label': 'Calitate',
  'quality.hint': 'Mai mic păstrează mai multe detalii. La 18 arată identic cu sursa.',

  'output.label': 'Salvează în',
  'output.beside': 'Lângă fiecare sursă',
  'output.change': 'Schimbă folderul',
  'output.reset': 'Folosește folderele sursă',

  'summary.in': '{size} intrare',
  'summary.out': 'cam {size} ieșire',

  'convert.go': 'Convertește',
  'convert.progress': '{done} din {total}',
  'convert.left': 'mai are {t}',
  'convert.cancel': 'Anulează',
  'convert.done': 'Gata',
  'convert.partial': '{ok} gata, {bad} eșuate',
  'convert.show': 'Arată fișierele',

  'ffmpeg.missing':
    'ffmpeg nu a fost găsit. Reinstalează aplicația sau pune ffmpeg în C:\\ffmpeg\\bin și repornește.',

  'settings.title': 'Setări',
  'settings.back': 'Înapoi la clipuri',

  'sec.general': 'General',
  'set.language': 'Limbă',
  'set.languageHint': 'Urmează limba din Windows dacă nu alegi alta.',
  'set.languageSystem': 'Sistem ({name})',
  'set.theme': 'Aspect',
  'set.themeSystem': 'Sistem',
  'set.themeLight': 'Luminos',
  'set.themeDark': 'Întunecat',
  'set.motion': 'Reduce animațiile',
  'set.motionHint': 'Schimbări instant în loc de animații. Nu depinde de setarea din Windows.',

  'sec.encoding': 'Encodare',
  'set.encoder': 'Encoder',
  'set.encoderAuto': 'Testat la pornire, a ales {name}.',
  'set.encoderForced': 'Forțat. Trece pe procesor dacă placa îl refuză.',
  'enc.auto': 'Automat',
  'enc.cpu': 'Procesor',
  'set.quality': 'Calitate Premiere',
  'set.audio': 'Bitrate audio',
  'set.audioHint': 'Folosit de ambele preseturi.',

  'sec.output': 'Ieșire',
  'set.folder': 'Folder',

  'sec.power': 'Alimentare',
  'set.awake': 'Ține calculatorul treaz',
  'set.awakeHint': 'Cât rulează lista. Oprit, riști un fișier tăiat dacă intră în repaus.',

  'sec.updates': 'Actualizări',
  'set.version': 'Versiune',
  'set.versionHint': 'Versiunile noi vin de pe pagina proiectului de pe GitHub.',
  'set.autoCheck': 'Verifică la pornire',
  'set.autoCheckHint': 'Doar verifică. Descărcarea o pornești tu.',
  'set.status': 'Stare',
  'upd.idle': 'Încă neverificat.',
  'upd.checking': 'Se verifică GitHub…',
  'upd.latest': 'Ai ultima versiune.',
  'upd.available': 'Versiunea {v} e disponibilă.',
  'upd.downloading': 'Se descarcă, {p}%.',
  'upd.ready': 'Versiunea {v} e gata. Repornește ca s-o instalezi.',
  'upd.error': 'Verificarea a eșuat. Încearcă din nou sau ia installer-ul de pe pagina de versiuni.',
  'upd.errNetwork': 'GitHub nu răspunde. Verifică conexiunea și încearcă din nou.',
  'upd.errNoRelease': 'Pe GitHub nu e încă nicio versiune. Încearcă mai târziu.',
  'upd.releases': 'Pagina de versiuni',
  'upd.dev': 'Actualizările merg doar în aplicația instalată.',
  'upd.check': 'Verifică acum',
  'upd.download': 'Descarcă',
  'upd.install': 'Repornește și instalează',

  'sec.system': 'Sistem',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'Negăsit',
  'set.active': 'Encoder activ',
  'set.activeHint': 'Ce va folosi următoarea listă.',

  'dialog.pick': 'Alege clipuri',
  'dialog.video': 'Video',
  'dialog.output': 'Alege folderul de ieșire',
}

const de: Table = {
  'lang.name': 'Deutsch',

  'tip.settings': 'Einstellungen',
  'tip.themeDark': 'Dunkles Design',
  'tip.themeLight': 'Helles Design',
  'tip.power': 'Geplantes Herunterfahren',

  'update.available': 'Update auf {v}',
  'update.downloading': 'Lädt {p}%',
  'update.ready': 'Neu starten zum Aktualisieren',

  'power.title': 'PC herunterfahren nach',
  'power.hint': 'Windows hält den Timer, er löst also auch bei geschlossener App aus.',
  'power.arm': 'Herunterfahren planen',
  'power.armed': 'Herunterfahren in',
  'power.cancel': 'Herunterfahren abbrechen',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clips',
  'queue.count': { one: '{n} Clip', other: '{n} Clips' },
  'queue.add': 'Clips hinzufügen',
  'queue.clear': 'Leeren',
  'queue.clearDone': 'Fertige entfernen',

  'empty.title': 'Clips hier ablegen',
  'empty.sub': 'oder klicken zum Auswählen. MP4, MOV, MKV und die meisten Kameraformate.',
  'empty.shortsSource': '16:9-Quelle, bis 4K',
  'empty.shortsCrop': '9:16-Ausschnitt in 1080×1920',
  'empty.premiereSource': 'Kameradatei, variable Bildrate',
  'empty.premiereOut': 'Premiere-Kopie, konstante Bildrate',

  'veil.release': {
    one: 'Loslassen, um {n} Clip hinzuzufügen',
    other: 'Loslassen, um {n} Clips hinzuzufügen',
  },
  'veil.generic': 'Loslassen zum Hinzufügen',

  'row.vfr': 'Variable fps',
  'row.vfrTip': 'Variable Bildrate, die übliche Ursache für Ruckeln im Schnitt. Diese Konvertierung behebt sie.',
  'row.remove': 'Aus der Liste entfernen',
  'row.reveal': 'Im Ordner zeigen',
  'row.left': 'noch {t}',
  'row.waiting': 'Wartet',
  'row.cancelled': 'Abgebrochen',
  'row.failed': 'Fehlgeschlagen',
  'row.errNotFound': 'Datei nicht gefunden',
  'row.errNoVideo': 'Keine Videospur in dieser Datei',
  'row.errUnreadable': 'Datei konnte nicht gelesen werden',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'Schnittfertiges H.264',
  'preset.premiereDesc':
    'Bereitet Kameradateien so auf, dass Premiere sie ohne Ruckeln öffnet und abspielt. Konstante Bildrate, alle Tonspuren bleiben erhalten.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Vorbereitet für CapCut',
  'preset.shortsDesc':
    'Der ganze Clip, bereit für einen Shorts-Editor, der in CapCut hochkant schneidet. Bleibt 16:9, mit genug Auflösung für einen scharfen 9:16-Ausschnitt.',

  'spec.codec': 'Codec',
  'spec.frameRate': 'Bildrate',
  'spec.encoder': 'Encoder',
  'spec.audio': 'Audio',
  'spec.frame': 'Bild',
  'spec.keyframes': 'Keyframes',
  'spec.madeFor': 'Für',
  'val.h264': 'H.264, 8 Bit 4:2:0',
  'val.h264High': 'H.264 High, 8 Bit',
  'val.cfr': 'Konstant, wie Quelle',
  'val.upTo60': 'Wie Quelle, max. 60',
  'val.frame': '16:9 bleibt, bis 4K',
  'val.everySecond': 'Jede Sekunde',
  'val.audioAll': 'AAC {k} kbps, alle Spuren',
  'val.audioStereo': 'AAC {k} kbps Stereo',
  'val.gpu': '{name}, Grafikkarte',
  'val.cpu': 'Prozessor',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Bitrate nach Auflösung',
  'tier.res': 'Auflösung',
  'tier.low': 'Bis 30 fps',
  'tier.high': '60 fps',
  'tier.inQueue': 'In deiner Liste',

  'quality.label': 'Qualität',
  'quality.hint': 'Niedriger behält mehr Details. Bei 18 sieht es aus wie die Quelle.',

  'output.label': 'Speichern in',
  'output.beside': 'Neben jeder Quelle',
  'output.change': 'Ordner ändern',
  'output.reset': 'Quellordner verwenden',

  'summary.in': '{size} rein',
  'summary.out': 'etwa {size} raus',

  'convert.go': 'Konvertieren',
  'convert.progress': '{done} von {total}',
  'convert.left': 'noch {t}',
  'convert.cancel': 'Abbrechen',
  'convert.done': 'Alles fertig',
  'convert.partial': '{ok} fertig, {bad} fehlgeschlagen',
  'convert.show': 'Dateien zeigen',

  'ffmpeg.missing':
    'ffmpeg wurde nicht gefunden. Installiere die App neu oder lege ffmpeg in C:\\ffmpeg\\bin ab und starte neu.',

  'settings.title': 'Einstellungen',
  'settings.back': 'Zurück zu den Clips',

  'sec.general': 'Allgemein',
  'set.language': 'Sprache',
  'set.languageHint': 'Folgt Windows, solange du keine wählst.',
  'set.languageSystem': 'System ({name})',
  'set.theme': 'Darstellung',
  'set.themeSystem': 'System',
  'set.themeLight': 'Hell',
  'set.themeDark': 'Dunkel',
  'set.motion': 'Bewegung reduzieren',
  'set.motionHint': 'Sofortige Wechsel statt Animation. Unabhängig von der Windows-Einstellung.',

  'sec.encoding': 'Kodierung',
  'set.encoder': 'Encoder',
  'set.encoderAuto': 'Beim Start getestet, gewählt: {name}.',
  'set.encoderForced': 'Erzwungen. Fällt auf den Prozessor zurück, wenn die Karte ablehnt.',
  'enc.auto': 'Automatisch',
  'enc.cpu': 'Prozessor',
  'set.quality': 'Premiere-Qualität',
  'set.audio': 'Audio-Bitrate',
  'set.audioHint': 'Gilt für beide Presets.',

  'sec.output': 'Ausgabe',
  'set.folder': 'Ordner',

  'sec.power': 'Energie',
  'set.awake': 'PC wach halten',
  'set.awakeHint': 'Solange eine Liste läuft. Aus riskiert eine abgeschnittene Datei, wenn der PC schläft.',

  'sec.updates': 'Updates',
  'set.version': 'Version',
  'set.versionHint': 'Neue Versionen kommen von der Projektseite auf GitHub.',
  'set.autoCheck': 'Beim Start prüfen',
  'set.autoCheckHint': 'Prüft nur. Herunterladen entscheidest immer du.',
  'set.status': 'Status',
  'upd.idle': 'Noch nicht geprüft.',
  'upd.checking': 'GitHub wird geprüft…',
  'upd.latest': 'Du hast die neueste Version.',
  'upd.available': 'Version {v} ist verfügbar.',
  'upd.downloading': 'Lädt, {p}%.',
  'upd.ready': 'Version {v} ist bereit. Zum Installieren neu starten.',
  'upd.error': 'Die Prüfung ist fehlgeschlagen. Versuch es erneut oder lade den Installer von der Release-Seite.',
  'upd.errNetwork': 'GitHub ist nicht erreichbar. Prüfe die Verbindung und versuch es erneut.',
  'upd.errNoRelease': 'Auf GitHub gibt es noch keine Version. Versuch es später erneut.',
  'upd.releases': 'Release-Seite',
  'upd.dev': 'Updates laufen nur in der installierten App.',
  'upd.check': 'Jetzt prüfen',
  'upd.download': 'Herunterladen',
  'upd.install': 'Neu starten und installieren',

  'sec.system': 'System',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'Nicht gefunden',
  'set.active': 'Aktiver Encoder',
  'set.activeHint': 'Was die nächste Liste verwendet.',

  'dialog.pick': 'Clips auswählen',
  'dialog.video': 'Video',
  'dialog.output': 'Ausgabeordner wählen',
}

const fr: Table = {
  'lang.name': 'Français',

  'tip.settings': 'Réglages',
  'tip.themeDark': 'Thème sombre',
  'tip.themeLight': 'Thème clair',
  'tip.power': 'Arrêt programmé',

  'update.available': 'Mettre à jour vers {v}',
  'update.downloading': 'Téléchargement {p} %',
  'update.ready': 'Redémarrer pour mettre à jour',

  'power.title': 'Éteindre ce PC dans',
  'power.hint': 'Windows garde le minuteur, il se déclenche même si l’app est fermée.',
  'power.arm': 'Programmer l’arrêt',
  'power.armed': 'Arrêt dans',
  'power.cancel': 'Annuler l’arrêt',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clips',
  'queue.count': { one: '{n} clip', other: '{n} clips' },
  'queue.add': 'Ajouter des clips',
  'queue.clear': 'Vider',
  'queue.clearDone': 'Retirer les terminés',

  'empty.title': 'Déposez vos clips ici',
  'empty.sub': 'ou cliquez pour parcourir. MP4, MOV, MKV et la plupart des formats caméra.',
  'empty.shortsSource': 'Source 16:9, jusqu’à 4K',
  'empty.shortsCrop': 'Recadrage 9:16 en 1080×1920',
  'empty.premiereSource': 'Fichier caméra, cadence variable',
  'empty.premiereOut': 'Copie Premiere, cadence constante',

  'veil.release': {
    one: 'Relâchez pour ajouter {n} clip',
    many: 'Relâchez pour ajouter {n} clips',
    other: 'Relâchez pour ajouter {n} clips',
  },
  'veil.generic': 'Relâchez pour ajouter',

  'row.vfr': 'Cadence variable',
  'row.vfrTip': 'Cadence d’images variable, cause habituelle des saccades au montage. Cette conversion la corrige.',
  'row.remove': 'Retirer de la liste',
  'row.reveal': 'Afficher dans le dossier',
  'row.left': 'encore {t}',
  'row.waiting': 'En attente',
  'row.cancelled': 'Annulé',
  'row.failed': 'Échec',
  'row.errNotFound': 'Fichier introuvable',
  'row.errNoVideo': 'Aucune piste vidéo dans ce fichier',
  'row.errUnreadable': 'Impossible de lire ce fichier',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'H.264 prêt au montage',
  'preset.premiereDesc':
    'Normalise les fichiers caméra pour que Premiere les ouvre et les lise sans saccades. Cadence constante, toutes les pistes audio conservées.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Préparé pour CapCut',
  'preset.shortsDesc':
    'Le clip entier, prêt à être recadré à la verticale dans CapCut par un monteur de shorts. Reste en 16:9, avec assez de résolution pour un recadrage 9:16 net.',

  'spec.codec': 'Codec',
  'spec.frameRate': 'Cadence',
  'spec.encoder': 'Encodeur',
  'spec.audio': 'Audio',
  'spec.frame': 'Cadre',
  'spec.keyframes': 'Images clés',
  'spec.madeFor': 'Pour',
  'val.h264': 'H.264, 8 bits 4:2:0',
  'val.h264High': 'H.264 High, 8 bits',
  'val.cfr': 'Constante, comme la source',
  'val.upTo60': 'Comme la source, 60 max.',
  'val.frame': '16:9 conservé, jusqu’à 4K',
  'val.everySecond': 'Chaque seconde',
  'val.audioAll': 'AAC {k} kbps, toutes les pistes',
  'val.audioStereo': 'AAC {k} kbps stéréo',
  'val.gpu': '{name}, carte graphique',
  'val.cpu': 'Processeur',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Débit selon la résolution',
  'tier.res': 'Résolution',
  'tier.low': 'Jusqu’à 30 i/s',
  'tier.high': '60 i/s',
  'tier.inQueue': 'Dans votre liste',

  'quality.label': 'Qualité',
  'quality.hint': 'Plus bas garde plus de détails. À 18, identique à la source.',

  'output.label': 'Enregistrer dans',
  'output.beside': 'À côté de chaque source',
  'output.change': 'Changer de dossier',
  'output.reset': 'Utiliser les dossiers source',

  'summary.in': '{size} en entrée',
  'summary.out': 'environ {size} en sortie',

  'convert.go': 'Convertir',
  'convert.progress': '{done} sur {total}',
  'convert.left': 'encore {t}',
  'convert.cancel': 'Annuler',
  'convert.done': 'Terminé',
  'convert.partial': '{ok} terminés, {bad} en échec',
  'convert.show': 'Afficher les fichiers',

  'ffmpeg.missing':
    'ffmpeg est introuvable. Réinstallez l’app ou placez ffmpeg dans C:\\ffmpeg\\bin puis redémarrez.',

  'settings.title': 'Réglages',
  'settings.back': 'Retour aux clips',

  'sec.general': 'Général',
  'set.language': 'Langue',
  'set.languageHint': 'Suit Windows tant que vous n’en choisissez pas.',
  'set.languageSystem': 'Système ({name})',
  'set.theme': 'Apparence',
  'set.themeSystem': 'Système',
  'set.themeLight': 'Clair',
  'set.themeDark': 'Sombre',
  'set.motion': 'Réduire les animations',
  'set.motionHint': 'Changements instantanés au lieu d’animations. Indépendant du réglage Windows.',

  'sec.encoding': 'Encodage',
  'set.encoder': 'Encodeur',
  'set.encoderAuto': 'Testé au démarrage, choix : {name}.',
  'set.encoderForced': 'Forcé. Repasse sur le processeur si la carte refuse.',
  'enc.auto': 'Automatique',
  'enc.cpu': 'Processeur',
  'set.quality': 'Qualité Premiere',
  'set.audio': 'Débit audio',
  'set.audioHint': 'Utilisé par les deux préréglages.',

  'sec.output': 'Sortie',
  'set.folder': 'Dossier',

  'sec.power': 'Alimentation',
  'set.awake': 'Garder le PC éveillé',
  'set.awakeHint': 'Pendant une liste. Désactivé, un fichier peut être tronqué si le PC se met en veille.',

  'sec.updates': 'Mises à jour',
  'set.version': 'Version',
  'set.versionHint': 'Les nouvelles versions viennent de la page du projet sur GitHub.',
  'set.autoCheck': 'Vérifier au démarrage',
  'set.autoCheckHint': 'Vérifie seulement. Le téléchargement reste votre choix.',
  'set.status': 'État',
  'upd.idle': 'Pas encore vérifié.',
  'upd.checking': 'Vérification sur GitHub…',
  'upd.latest': 'Vous avez la dernière version.',
  'upd.available': 'La version {v} est disponible.',
  'upd.downloading': 'Téléchargement, {p} %.',
  'upd.ready': 'La version {v} est prête. Redémarrez pour l’installer.',
  'upd.error': 'La vérification a échoué. Réessayez, ou téléchargez l’installeur depuis la page des versions.',
  'upd.errNetwork': 'GitHub est injoignable. Vérifiez la connexion et réessayez.',
  'upd.errNoRelease': 'GitHub ne propose encore aucune version. Réessayez plus tard.',
  'upd.releases': 'Page des versions',
  'upd.dev': 'Les mises à jour ne fonctionnent que dans l’app installée.',
  'upd.check': 'Vérifier',
  'upd.download': 'Télécharger',
  'upd.install': 'Redémarrer et installer',

  'sec.system': 'Système',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'Introuvable',
  'set.active': 'Encodeur actif',
  'set.activeHint': 'Ce que la prochaine liste utilisera.',

  'dialog.pick': 'Choisir des clips',
  'dialog.video': 'Vidéo',
  'dialog.output': 'Choisir le dossier de sortie',
}

const es: Table = {
  'lang.name': 'Español',

  'tip.settings': 'Ajustes',
  'tip.themeDark': 'Tema oscuro',
  'tip.themeLight': 'Tema claro',
  'tip.power': 'Apagado programado',

  'update.available': 'Actualizar a {v}',
  'update.downloading': 'Descargando {p} %',
  'update.ready': 'Reiniciar para actualizar',

  'power.title': 'Apagar este PC en',
  'power.hint': 'Windows guarda el temporizador, así que se dispara aunque cierres la app.',
  'power.arm': 'Programar apagado',
  'power.armed': 'Se apaga en',
  'power.cancel': 'Cancelar apagado',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clips',
  'queue.count': { one: '{n} clip', many: '{n} clips', other: '{n} clips' },
  'queue.add': 'Añadir clips',
  'queue.clear': 'Vaciar',
  'queue.clearDone': 'Quitar terminados',

  'empty.title': 'Suelta tus clips aquí',
  'empty.sub': 'o haz clic para elegir. MP4, MOV, MKV y la mayoría de formatos de cámara.',
  'empty.shortsSource': 'Fuente 16:9, hasta 4K',
  'empty.shortsCrop': 'Recorte 9:16 a 1080×1920',
  'empty.premiereSource': 'Archivo de cámara, fps variables',
  'empty.premiereOut': 'Copia para Premiere, fps constantes',

  'veil.release': {
    one: 'Suelta para añadir {n} clip',
    many: 'Suelta para añadir {n} clips',
    other: 'Suelta para añadir {n} clips',
  },
  'veil.generic': 'Suelta para añadir',

  'row.vfr': 'Fps variables',
  'row.vfrTip': 'Frecuencia de fotogramas variable, la causa habitual de tirones al editar. Esta conversión lo corrige.',
  'row.remove': 'Quitar de la lista',
  'row.reveal': 'Mostrar en la carpeta',
  'row.left': 'quedan {t}',
  'row.waiting': 'En espera',
  'row.cancelled': 'Cancelado',
  'row.failed': 'Falló',
  'row.errNotFound': 'Archivo no encontrado',
  'row.errNoVideo': 'Este archivo no tiene pista de vídeo',
  'row.errUnreadable': 'No se pudo leer este archivo',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'H.264 listo para editar',
  'preset.premiereDesc':
    'Normaliza los archivos de cámara para que Premiere los abra y reproduzca sin tirones. Fps constantes y todas las pistas de audio.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Preparado para CapCut',
  'preset.shortsDesc':
    'El clip entero, listo para que un editor de shorts lo recorte en vertical en CapCut. Se queda en 16:9, con resolución de sobra para un recorte 9:16 nítido.',

  'spec.codec': 'Códec',
  'spec.frameRate': 'Fotogramas',
  'spec.encoder': 'Codificador',
  'spec.audio': 'Audio',
  'spec.frame': 'Encuadre',
  'spec.keyframes': 'Fotogramas clave',
  'spec.madeFor': 'Para',
  'val.h264': 'H.264, 8 bits 4:2:0',
  'val.h264High': 'H.264 High, 8 bits',
  'val.cfr': 'Constantes, como la fuente',
  'val.upTo60': 'Como la fuente, máx. 60',
  'val.frame': '16:9 intacto, hasta 4K',
  'val.everySecond': 'Cada segundo',
  'val.audioAll': 'AAC {k} kbps, todas las pistas',
  'val.audioStereo': 'AAC {k} kbps estéreo',
  'val.gpu': '{name}, tarjeta gráfica',
  'val.cpu': 'Procesador',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Bitrate según resolución',
  'tier.res': 'Resolución',
  'tier.low': 'Hasta 30 fps',
  'tier.high': '60 fps',
  'tier.inQueue': 'En tu lista',

  'quality.label': 'Calidad',
  'quality.hint': 'Más bajo conserva más detalle. A 18 se ve igual que la fuente.',

  'output.label': 'Guardar en',
  'output.beside': 'Junto a cada fuente',
  'output.change': 'Cambiar carpeta',
  'output.reset': 'Usar las carpetas de origen',

  'summary.in': '{size} de entrada',
  'summary.out': 'unos {size} de salida',

  'convert.go': 'Convertir',
  'convert.progress': '{done} de {total}',
  'convert.left': 'quedan {t}',
  'convert.cancel': 'Cancelar',
  'convert.done': 'Todo listo',
  'convert.partial': '{ok} listos, {bad} fallidos',
  'convert.show': 'Mostrar archivos',

  'ffmpeg.missing':
    'No se encontró ffmpeg. Reinstala la app o coloca ffmpeg en C:\\ffmpeg\\bin y reinicia.',

  'settings.title': 'Ajustes',
  'settings.back': 'Volver a los clips',

  'sec.general': 'General',
  'set.language': 'Idioma',
  'set.languageHint': 'Sigue a Windows mientras no elijas otro.',
  'set.languageSystem': 'Sistema ({name})',
  'set.theme': 'Apariencia',
  'set.themeSystem': 'Sistema',
  'set.themeLight': 'Claro',
  'set.themeDark': 'Oscuro',
  'set.motion': 'Reducir animaciones',
  'set.motionHint': 'Cambios instantáneos en lugar de animaciones. Independiente del ajuste de Windows.',

  'sec.encoding': 'Codificación',
  'set.encoder': 'Codificador',
  'set.encoderAuto': 'Probado al iniciar, eligió {name}.',
  'set.encoderForced': 'Forzado. Vuelve al procesador si la tarjeta lo rechaza.',
  'enc.auto': 'Automático',
  'enc.cpu': 'Procesador',
  'set.quality': 'Calidad Premiere',
  'set.audio': 'Bitrate de audio',
  'set.audioHint': 'Lo usan los dos preajustes.',

  'sec.output': 'Salida',
  'set.folder': 'Carpeta',

  'sec.power': 'Energía',
  'set.awake': 'Mantener el PC despierto',
  'set.awakeHint': 'Mientras corre una lista. Si lo desactivas, un archivo puede quedar cortado si el PC se suspende.',

  'sec.updates': 'Actualizaciones',
  'set.version': 'Versión',
  'set.versionHint': 'Las versiones nuevas llegan desde la página del proyecto en GitHub.',
  'set.autoCheck': 'Comprobar al iniciar',
  'set.autoCheckHint': 'Solo comprueba. Descargar siempre lo decides tú.',
  'set.status': 'Estado',
  'upd.idle': 'Aún sin comprobar.',
  'upd.checking': 'Comprobando GitHub…',
  'upd.latest': 'Tienes la última versión.',
  'upd.available': 'La versión {v} está disponible.',
  'upd.downloading': 'Descargando, {p} %.',
  'upd.ready': 'La versión {v} está lista. Reinicia para instalarla.',
  'upd.error': 'La comprobación falló. Vuelve a intentarlo o descarga el instalador desde la página de versiones.',
  'upd.errNetwork': 'No se pudo conectar con GitHub. Revisa la conexión y vuelve a intentarlo.',
  'upd.errNoRelease': 'GitHub todavía no ofrece ninguna versión. Inténtalo más tarde.',
  'upd.releases': 'Página de versiones',
  'upd.dev': 'Las actualizaciones solo funcionan en la app instalada.',
  'upd.check': 'Comprobar ahora',
  'upd.download': 'Descargar',
  'upd.install': 'Reiniciar e instalar',

  'sec.system': 'Sistema',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'No encontrado',
  'set.active': 'Codificador activo',
  'set.activeHint': 'Lo que usará la próxima lista.',

  'dialog.pick': 'Elegir clips',
  'dialog.video': 'Vídeo',
  'dialog.output': 'Elegir carpeta de salida',
}

const it: Table = {
  'lang.name': 'Italiano',

  'tip.settings': 'Impostazioni',
  'tip.themeDark': 'Tema scuro',
  'tip.themeLight': 'Tema chiaro',
  'tip.power': 'Spegnimento programmato',

  'update.available': 'Aggiorna a {v}',
  'update.downloading': 'Download {p}%',
  'update.ready': 'Riavvia per aggiornare',

  'power.title': 'Spegni questo PC tra',
  'power.hint': 'Il timer lo tiene Windows, quindi scatta anche se chiudi l’app.',
  'power.arm': 'Programma spegnimento',
  'power.armed': 'Spegnimento tra',
  'power.cancel': 'Annulla spegnimento',
  'unit.h': 'h',
  'unit.m': 'min',
  'unit.s': 's',

  'queue.title': 'Clip',
  'queue.count': { one: '{n} clip', many: '{n} clip', other: '{n} clip' },
  'queue.add': 'Aggiungi clip',
  'queue.clear': 'Svuota',
  'queue.clearDone': 'Togli i completati',

  'empty.title': 'Trascina qui le clip',
  'empty.sub': 'oppure fai clic per sceglierle. MP4, MOV, MKV e quasi tutti i formati da fotocamera.',
  'empty.shortsSource': 'Sorgente 16:9, fino a 4K',
  'empty.shortsCrop': 'Ritaglio 9:16 a 1080×1920',
  'empty.premiereSource': 'File di camera, fps variabili',
  'empty.premiereOut': 'Copia per Premiere, fps costanti',

  'veil.release': {
    one: 'Rilascia per aggiungere {n} clip',
    many: 'Rilascia per aggiungere {n} clip',
    other: 'Rilascia per aggiungere {n} clip',
  },
  'veil.generic': 'Rilascia per aggiungere',

  'row.vfr': 'Fps variabili',
  'row.vfrTip': 'Frame rate variabile, la causa tipica degli scatti in montaggio. Questa conversione lo corregge.',
  'row.remove': 'Togli dalla lista',
  'row.reveal': 'Mostra nella cartella',
  'row.left': 'mancano {t}',
  'row.waiting': 'In attesa',
  'row.cancelled': 'Annullato',
  'row.failed': 'Non riuscito',
  'row.errNotFound': 'File non trovato',
  'row.errNoVideo': 'Nessuna traccia video in questo file',
  'row.errUnreadable': 'Impossibile leggere questo file',

  'preset.premiere': 'Premiere',
  'preset.premiereTag': 'H.264 pronto al montaggio',
  'preset.premiereDesc':
    'Normalizza i file della fotocamera perché Premiere li apra e li scorra senza scatti. Fps costanti, tutte le tracce audio mantenute.',
  'preset.shorts': 'Shorts',
  'preset.shortsTag': 'Pronto per CapCut',
  'preset.shortsDesc':
    'La clip intera, pronta perché un editor di shorts la tagli in verticale su CapCut. Resta in 16:9, con risoluzione sufficiente per un ritaglio 9:16 nitido.',

  'spec.codec': 'Codec',
  'spec.frameRate': 'Fotogrammi',
  'spec.encoder': 'Encoder',
  'spec.audio': 'Audio',
  'spec.frame': 'Inquadratura',
  'spec.keyframes': 'Keyframe',
  'spec.madeFor': 'Per',
  'val.h264': 'H.264, 8 bit 4:2:0',
  'val.h264High': 'H.264 High, 8 bit',
  'val.cfr': 'Costanti, come la sorgente',
  'val.upTo60': 'Come la sorgente, max 60',
  'val.frame': '16:9 mantenuto, fino a 4K',
  'val.everySecond': 'Ogni secondo',
  'val.audioAll': 'AAC {k} kbps, tutte le tracce',
  'val.audioStereo': 'AAC {k} kbps stereo',
  'val.gpu': '{name}, scheda video',
  'val.cpu': 'Processore',
  'val.platforms': 'YouTube, TikTok, Instagram, Facebook',

  'tier.title': 'Bitrate per risoluzione',
  'tier.res': 'Risoluzione',
  'tier.low': 'Fino a 30 fps',
  'tier.high': '60 fps',
  'tier.inQueue': 'Nella tua lista',

  'quality.label': 'Qualità',
  'quality.hint': 'Più basso conserva più dettagli. A 18 è identico alla sorgente.',

  'output.label': 'Salva in',
  'output.beside': 'Accanto a ogni sorgente',
  'output.change': 'Cambia cartella',
  'output.reset': 'Usa le cartelle di origine',

  'summary.in': '{size} in ingresso',
  'summary.out': 'circa {size} in uscita',

  'convert.go': 'Converti',
  'convert.progress': '{done} di {total}',
  'convert.left': 'mancano {t}',
  'convert.cancel': 'Annulla',
  'convert.done': 'Tutto fatto',
  'convert.partial': '{ok} fatti, {bad} non riusciti',
  'convert.show': 'Mostra i file',

  'ffmpeg.missing':
    'ffmpeg non trovato. Reinstalla l’app oppure metti ffmpeg in C:\\ffmpeg\\bin e riavvia.',

  'settings.title': 'Impostazioni',
  'settings.back': 'Torna alle clip',

  'sec.general': 'Generale',
  'set.language': 'Lingua',
  'set.languageHint': 'Segue Windows finché non ne scegli una.',
  'set.languageSystem': 'Sistema ({name})',
  'set.theme': 'Aspetto',
  'set.themeSystem': 'Sistema',
  'set.themeLight': 'Chiaro',
  'set.themeDark': 'Scuro',
  'set.motion': 'Riduci animazioni',
  'set.motionHint': 'Cambi istantanei al posto delle animazioni. Indipendente dall’impostazione di Windows.',

  'sec.encoding': 'Codifica',
  'set.encoder': 'Encoder',
  'set.encoderAuto': 'Testato all’avvio, scelto {name}.',
  'set.encoderForced': 'Forzato. Torna al processore se la scheda lo rifiuta.',
  'enc.auto': 'Automatico',
  'enc.cpu': 'Processore',
  'set.quality': 'Qualità Premiere',
  'set.audio': 'Bitrate audio',
  'set.audioHint': 'Usato da entrambi i preset.',

  'sec.output': 'Uscita',
  'set.folder': 'Cartella',

  'sec.power': 'Alimentazione',
  'set.awake': 'Tieni sveglio il PC',
  'set.awakeHint': 'Mentre gira una lista. Se lo spegni, un file può restare troncato se il PC va in sospensione.',

  'sec.updates': 'Aggiornamenti',
  'set.version': 'Versione',
  'set.versionHint': 'Le nuove versioni arrivano dalla pagina del progetto su GitHub.',
  'set.autoCheck': 'Controlla all’avvio',
  'set.autoCheckHint': 'Controlla soltanto. Il download lo decidi sempre tu.',
  'set.status': 'Stato',
  'upd.idle': 'Non ancora controllato.',
  'upd.checking': 'Controllo su GitHub…',
  'upd.latest': 'Hai l’ultima versione.',
  'upd.available': 'La versione {v} è disponibile.',
  'upd.downloading': 'Download, {p}%.',
  'upd.ready': 'La versione {v} è pronta. Riavvia per installarla.',
  'upd.error': 'Il controllo non è riuscito. Riprova, oppure scarica l’installer dalla pagina delle versioni.',
  'upd.errNetwork': 'GitHub non è raggiungibile. Controlla la connessione e riprova.',
  'upd.errNoRelease': 'Su GitHub non c’è ancora nessuna versione. Riprova più tardi.',
  'upd.releases': 'Pagina delle versioni',
  'upd.dev': 'Gli aggiornamenti funzionano solo nell’app installata.',
  'upd.check': 'Controlla ora',
  'upd.download': 'Scarica',
  'upd.install': 'Riavvia e installa',

  'sec.system': 'Sistema',
  'set.ffmpeg': 'ffmpeg',
  'set.ffmpegMissing': 'Non trovato',
  'set.active': 'Encoder attivo',
  'set.activeHint': 'Quello che userà la prossima lista.',

  'dialog.pick': 'Scegli le clip',
  'dialog.video': 'Video',
  'dialog.output': 'Scegli la cartella di uscita',
}

const TABLES: Record<LanguageCode, Table> = { en, ro, de, fr, es, it }

/** 'ro-RO' and 'ro' both land on ro; anything unknown lands on English. */
export function resolveLanguage(setting: Language, systemLocale: string): LanguageCode {
  if (setting !== 'system') return setting
  const base = systemLocale.toLowerCase().split(/[-_]/)[0]
  return (LANGUAGE_CODES as readonly string[]).includes(base) ? (base as LanguageCode) : 'en'
}

export function nativeName(code: LanguageCode): string {
  return TABLES[code]['lang.name'] as string
}

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

export function translator(lang: LanguageCode): Translate {
  const table = TABLES[lang]
  const rules = new Intl.PluralRules(lang)
  return (key, vars = {}) => {
    const entry = table[key] ?? en[key]
    let text: string
    if (typeof entry === 'string') {
      text = entry
    } else {
      const n = Number(vars.n ?? 0)
      const form = rules.select(n) as keyof Plural
      text = entry[form] ?? entry.other
    }
    return text.replace(/\{(\w+)\}/g, (_, name: string) =>
      vars[name] === undefined ? `{${name}}` : String(vars[name]),
    )
  }
}
