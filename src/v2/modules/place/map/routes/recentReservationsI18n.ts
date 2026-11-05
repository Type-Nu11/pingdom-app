export const recentReservationResources = {
  ko: { title: '최근 예약', empty: '도착지로 선택할 수 있는 예약이 없습니다.', select: '{{name}} 도착지로 설정', failed: '예약 장소를 불러오지 못했습니다. 다시 눌러 주세요.' },
  en: { title: 'Recent reservations', empty: 'No reservations available to select as a destination.', select: 'Set {{name}} as destination', failed: 'Could not load this reservation’s place. Tap again to retry.' },
  ja: { title: '最近の予約', empty: '目的地に選択できる予約はありません。', select: '{{name}}を目的地に設定', failed: '予約した場所を読み込めませんでした。もう一度タップしてください。' },
  'zh-CN': { title: '最近预约', empty: '没有可选为目的地的预约。', select: '将{{name}}设为终点', failed: '无法加载预约地点，请再次点击重试。' },
  'zh-TW': { title: '最近預約', empty: '沒有可選為目的地的預約。', select: '將{{name}}設為終點', failed: '無法載入預約地點，請再次點擊重試。' },
  vi: { title: 'Đặt chỗ gần đây', empty: 'Không có đặt chỗ có thể chọn làm điểm đến.', select: 'Đặt {{name}} làm điểm đến', failed: 'Không thể tải địa điểm đã đặt. Nhấn lại để thử lại.' },
  es: { title: 'Reservas recientes', empty: 'No hay reservas para seleccionar como destino.', select: 'Establecer {{name}} como destino', failed: 'No se pudo cargar el lugar de la reserva. Toca de nuevo para reintentar.' },
  pt: { title: 'Reservas recentes', empty: 'Não há reservas para selecionar como destino.', select: 'Definir {{name}} como destino', failed: 'Não foi possível carregar o local da reserva. Toque novamente para tentar.' },
  th: { title: 'การจองล่าสุด', empty: 'ไม่มีการจองที่เลือกเป็นจุดหมายได้', select: 'ตั้ง {{name}} เป็นจุดหมาย', failed: 'โหลดสถานที่ที่จองไม่สำเร็จ กรุณาแตะอีกครั้งเพื่อลองใหม่' },
} as const;
