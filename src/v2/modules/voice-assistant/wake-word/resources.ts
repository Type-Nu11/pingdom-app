export const wakeWordResources = {
  ko: {
    title: '“Hey Pingdy”로 호출',
    notice: '지도가 열린 동안 마이크를 사용해 기기 안에서 “Hey Pingdy”를 감지합니다. 감지 전 음성은 저장하거나 서버로 보내지 않습니다. 감지 후 AI 입력이 열리면 말씀하신 요청은 기존 AI 안내에 따라 서버로 전송됩니다. 언제든 호출어 듣기를 중지할 수 있습니다.',
    cancel: '취소', enable: '호출어 듣기 켜기', stop: '호출어 듣기 중지',
    hint: '앱과 지도가 활성 상태일 때만 작동합니다. AI 입력 중에는 호출어 감지를 멈춥니다.',
    states: { unavailable: '이 기기에서 호출어 감지를 사용할 수 없습니다.', disabled: '호출어 듣기 꺼짐', initializing: '호출어 듣기 준비 중', listening: '“Hey Pingdy” 듣는 중', detected: '호출어 감지됨', cooldown: '다음 호출 준비 중', suspended: '호출어 듣기 일시 중지', error: '호출어 듣기가 중단되었습니다. 권한과 오디오 사용 상태를 확인해 주세요.' },
  },
  en: {
    title: 'Call with “Hey Pingdy”',
    notice: 'While the map is open, the microphone detects the English wake phrase “Hey Pingdy” on your device. Audio before detection is neither stored nor sent to a server. After detection opens AI input, your spoken request is sent under the existing AI notice. You can stop wake-word listening at any time.',
    cancel: 'Cancel', enable: 'Enable wake word', stop: 'Stop wake word',
    hint: 'Works only while the app and map are active. Wake-word detection pauses during AI input.',
    states: { unavailable: 'Wake-word detection is unavailable on this device.', disabled: 'Wake word off', initializing: 'Preparing wake word', listening: 'Listening for “Hey Pingdy”', detected: 'Wake word detected', cooldown: 'Preparing the next call', suspended: 'Wake word paused', error: 'Wake-word listening stopped. Check permissions and audio use.' },
  },
  ja: {
    title: '「Hey Pingdy」で呼び出す', cancel: 'キャンセル', enable: '呼びかけの検出を有効にする', stop: '呼びかけの検出を停止',
    notice: '地図の表示中、マイクで英語の「Hey Pingdy」を端末内で検出します。検出前の音声は保存・送信されません。検出後に開くAI入力の音声は、既存のAI案内に従ってサーバーに送信されます。検出はいつでも停止できます。',
    hint: 'アプリと地図が表示されている間のみ動作します。AI入力中は検出を停止します。',
    states: { unavailable: 'この端末では呼びかけを検出できません。', disabled: '呼びかけの検出は無効です', initializing: '検出の準備中', listening: '「Hey Pingdy」を待機中', detected: '呼びかけを検出しました', cooldown: '次の呼びかけを準備中', suspended: '検出を一時停止中', error: '検出が停止しました。権限と音声の使用状況をご確認ください。' },
  },
  'zh-CN': {
    title: '用“Hey Pingdy”唤醒', cancel: '取消', enable: '开启唤醒词监听', stop: '停止唤醒词监听',
    notice: '显示地图时，麦克风会在设备上识别英语唤醒词“Hey Pingdy”。唤醒前的音频不会保存或发送到服务器。唤醒后，语音请求会按照现有人工智能说明发送到服务器。您可以随时停止监听。',
    hint: '仅在应用和地图处于前台时工作。人工智能输入期间会暂停监听。',
    states: { unavailable: '此设备不支持唤醒词检测。', disabled: '唤醒词监听已关闭', initializing: '正在准备监听', listening: '正在监听“Hey Pingdy”', detected: '已检测到唤醒词', cooldown: '正在准备下次唤醒', suspended: '唤醒词监听已暂停', error: '监听已停止。请检查权限和音频使用情况。' },
  },
  'zh-TW': {
    title: '用「Hey Pingdy」喚醒', cancel: '取消', enable: '開啟喚醒詞聆聽', stop: '停止喚醒詞聆聽',
    notice: '顯示地圖時，麥克風會在裝置上辨識英語喚醒詞「Hey Pingdy」。喚醒前的音訊不會儲存或傳送至伺服器。喚醒後，語音請求會依照現有人工智慧說明傳送至伺服器。您可以隨時停止聆聽。',
    hint: '僅在應用程式和地圖位於前景時運作。人工智慧輸入期間會暫停聆聽。',
    states: { unavailable: '此裝置不支援喚醒詞偵測。', disabled: '喚醒詞聆聽已關閉', initializing: '正在準備聆聽', listening: '正在聆聽「Hey Pingdy」', detected: '已偵測到喚醒詞', cooldown: '正在準備下次喚醒', suspended: '喚醒詞聆聽已暫停', error: '聆聽已停止。請檢查權限與音訊使用情況。' },
  },
  vi: {
    title: 'Gọi bằng “Hey Pingdy”', cancel: 'Hủy', enable: 'Bật nghe từ đánh thức', stop: 'Dừng nghe từ đánh thức',
    notice: 'Khi bản đồ đang mở, micrô phát hiện cụm từ tiếng Anh “Hey Pingdy” ngay trên thiết bị. Âm thanh trước khi phát hiện không được lưu hay gửi đến máy chủ. Sau khi mở phần nhập AI, yêu cầu bằng giọng nói được gửi theo thông báo AI hiện có. Bạn có thể dừng nghe bất cứ lúc nào.',
    hint: 'Chỉ hoạt động khi ứng dụng và bản đồ ở phía trước. Tạm dừng khi nhập AI.',
    states: { unavailable: 'Thiết bị này không hỗ trợ từ đánh thức.', disabled: 'Đã tắt từ đánh thức', initializing: 'Đang chuẩn bị nghe', listening: 'Đang nghe “Hey Pingdy”', detected: 'Đã phát hiện từ đánh thức', cooldown: 'Đang chuẩn bị lần gọi tiếp theo', suspended: 'Đã tạm dừng nghe', error: 'Đã dừng nghe. Hãy kiểm tra quyền và việc sử dụng âm thanh.' },
  },
  es: {
    title: 'Llamar con «Hey Pingdy»', cancel: 'Cancelar', enable: 'Activar palabra de activación', stop: 'Detener escucha',
    notice: 'Mientras el mapa está abierto, el micrófono detecta la frase inglesa «Hey Pingdy» en el dispositivo. El audio previo no se guarda ni se envía a un servidor. Al abrir la entrada de IA, su solicitud se envía según el aviso de IA existente. Puede detener la escucha en cualquier momento.',
    hint: 'Solo funciona con la aplicación y el mapa en primer plano. Se pausa durante la entrada de IA.',
    states: { unavailable: 'La detección no está disponible en este dispositivo.', disabled: 'Palabra de activación desactivada', initializing: 'Preparando la escucha', listening: 'Escuchando «Hey Pingdy»', detected: 'Palabra de activación detectada', cooldown: 'Preparando la siguiente llamada', suspended: 'Escucha en pausa', error: 'La escucha se detuvo. Revise los permisos y el uso de audio.' },
  },
  'pt-BR': {
    title: 'Chamar com “Hey Pingdy”', cancel: 'Cancelar', enable: 'Ativar palavra de ativação', stop: 'Parar escuta',
    notice: 'Enquanto o mapa estiver aberto, o microfone detecta a frase inglesa “Hey Pingdy” no dispositivo. O áudio anterior não é salvo nem enviado ao servidor. Ao abrir a entrada de IA, sua solicitação é enviada conforme o aviso de IA existente. Você pode parar a escuta a qualquer momento.',
    hint: 'Funciona apenas com o aplicativo e o mapa em primeiro plano. Pausa durante a entrada de IA.',
    states: { unavailable: 'A detecção não está disponível neste dispositivo.', disabled: 'Palavra de ativação desativada', initializing: 'Preparando a escuta', listening: 'Ouvindo “Hey Pingdy”', detected: 'Palavra de ativação detectada', cooldown: 'Preparando a próxima chamada', suspended: 'Escuta pausada', error: 'A escuta parou. Confira as permissões e o uso do áudio.' },
  },
};
