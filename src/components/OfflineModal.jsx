import { useEffect, useState } from 'react';
import {
  Archive, Check, Download, FileJson, HardDrive, Info, ShieldCheck,
  Smartphone, Upload, Wifi, WifiOff,
} from 'lucide-react';
import { useGame } from '../context';
import { gameCatalog } from '../gameData';
import { createSave, parseSave } from '../saveData';
import { Modal } from './UI';

export default function OfflineModal() {
  const {
    progress, spoilerFree, inventory, journal, favorites, challengeAccepted,
    restoreSave, setModal, showToast,
  } = useGame();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const isFileBuild = window.location.protocol === 'file:';
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    const beforeInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const installed = () => { setInstallPrompt(null); showToast('TERRA Летопись установлена. Каталог доступен автономно.'); };
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
    };
  }, [showToast]);

  const exportBackup = () => {
    const save = createSave({ progress, spoilerFree, inventory, journal, favorites, challengeAccepted });
    const url = URL.createObjectURL(new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `TERRA-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Резервная копия скачана.');
  };

  const readBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setPending(null);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Файл слишком большой для сохранения TERRA.');
      const data = parseSave(await file.text());
      setPending({ data, name: file.name });
    } catch (exception) {
      setError(exception instanceof SyntaxError ? 'Не удалось прочитать JSON. Выбери файл сохранения TERRA.' : exception.message);
    }
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <Modal onClose={() => setModal(null)} label="Офлайн-версия и сохранение" className="item-modal offline-modal">
      <div className="offline-modal__heading">
        <span><HardDrive size={29} /></span>
        <div><span className="eyebrow">TERRA БЕЗ ИНТЕРНЕТА</span><h2>Твой справочник. Всегда с собой.</h2><p>Terraria {gameCatalog.meta.gameVersion} · данные от {gameCatalog.meta.dataVersion}</p></div>
        <span className={`offline-status ${online ? 'is-online' : ''}`}>{online ? <Wifi size={14} /> : <WifiOff size={14} />}{online ? 'Онлайн' : 'Без сети'}</span>
      </div>

      <section className="offline-download-card">
        <div><Archive size={25} /><span><strong>{isFileBuild ? 'Офлайн-версия уже запущена' : 'Скачать полную офлайн-версию'}</strong><small>ZIP · предметы, рецепты, спрайты, GIF, шрифты и поиск</small></span></div>
        {!isFileBuild && <a className="button button--primary" href="downloads/TERRA-Offline.zip" download="TERRA-Offline.zip"><Download size={17} /> Скачать ZIP</a>}
        {isFileBuild && <span className="offline-ready"><Check size={16} /> Работает локально</span>}
      </section>
      <ol className="offline-steps">
        <li><span>1</span><p><strong>Скачай и распакуй архив.</strong> Ничего устанавливать не нужно.</p></li>
        <li><span>2</span><p><strong>Открой <code>index.html</code> двойным кликом.</strong> Подойдут Chrome, Edge, Firefox и Safari.</p></li>
        <li><span>3</span><p><strong>Можно отключить интернет.</strong> Все разделы работают локально; внешние ссылки Wiki открываются только онлайн.</p></li>
      </ol>

      <section className="offline-section">
        <div className="offline-section__title"><FileJson size={18} /><div><strong>Резервная копия</strong><p>Переноси рюкзак, прогресс, избранное и дневник между версиями.</p></div></div>
        <div className="offline-backup-actions"><button className="button button--soft" onClick={exportBackup}><Download size={16} /> Экспорт JSON</button><label className="button button--soft"><Upload size={16} /> Импорт JSON<input type="file" accept="application/json,.json" onChange={readBackup} hidden /></label></div>
        {error && <p className="offline-error" role="alert">{error}</p>}
        {pending && <div className="offline-import-preview">
          <strong>Проверь файл: {pending.name}</strong>
          <span>{pending.data.progress.length} глав · {Object.keys(pending.data.inventory).length} предметов в рюкзаке · {pending.data.journal.length} записей · {pending.data.favorites.length} в избранном</span>
          <p>После подтверждения текущие локальные данные будут заменены.</p>
          <div><button className="button button--ghost" onClick={() => setPending(null)}>Отмена</button><button className="button button--primary" onClick={() => restoreSave(pending.data)}><Check size={15} /> Восстановить</button></div>
        </div>}
      </section>

      <section className="offline-section offline-install">
        <div className="offline-section__title"><Smartphone size={18} /><div><strong>{isInstalled ? 'Приложение установлено' : 'Установка на телефон или компьютер'}</strong><p>Автономный кэш для онлайн-версии. Скачиваемый ZIP при этом остаётся отдельным полным вариантом.</p></div></div>
        {installPrompt && !isInstalled && <button className="button button--soft" onClick={install}><Download size={16} /> Установить приложение</button>}
        {!installPrompt && !isInstalled && <small><Info size={13} /> Если кнопки установки нет, открой меню браузера → «Установить приложение» или «Добавить на главный экран». В HTML Preview установка может быть недоступна.</small>}
        {isInstalled && <span className="offline-ready"><Check size={15} /> Автономный кэш активен</span>}
      </section>
      <div className="offline-privacy"><ShieldCheck size={17} /><p>Прогресс хранится только на этом устройстве. Архив и резервная копия не отправляют данные на сервер.</p></div>
      <div className="modal-actions"><button className="button button--primary" onClick={() => setModal(null)}>Готово <Check size={16} /></button></div>
    </Modal>
  );
}
