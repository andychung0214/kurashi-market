const image = (id, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

export const categories = [
  { id: 'books', name: '二手書', note: '留有時間手感的閱讀選本' },
  { id: 'invitations', name: '喜帖', note: '讓紙張替重要日子開口' },
  { id: 'interiors', name: '室內設計', note: '安放日常的空間提案' },
  { id: 'goods', name: '百貨雜物', note: '經得起每日使用的器物' }
];

export const products = [
  {
    id: 'book-mountain-notes', category: 'books', kind: 'product', name: '山之書｜自然散策集',
    price: 420, stock: 2, featured: true, badge: '僅此兩冊',
    summary: '帶著鉛筆眉批的山林散文，書頁有溫和歲月色。',
    description: '一本適合放進旅行袋的散策集。前任讀者留下少量鉛筆線，沒有缺頁與水痕。',
    images: [image('photo-1544947950-fa07a98d237f'), image('photo-1519682337058-a94d519337bc')],
    tags: ['山', '散文', '自然'], details: { condition: '良好，有少量眉批', author: '川上修一', publisher: '白露社', year: '2018' }
  },
  {
    id: 'book-tokyo-kitchen', category: 'books', kind: 'product', name: '東京小廚房',
    price: 360, stock: 1, featured: true, badge: '一期一會',
    summary: '從市場到餐桌的 48 道家常味，附舊書店藏書章。',
    description: '內頁乾淨，封面書角有自然磨損，適合喜歡家庭料理與東京日常的讀者。',
    images: [image('photo-1547592180-85f173990554'), image('photo-1498837167922-ddd27525d352')],
    tags: ['料理', '東京', '生活'], details: { condition: '書角輕微磨損', author: '森野惠', publisher: '日日出版', year: '2020' }
  },
  {
    id: 'book-architecture-light', category: 'books', kind: 'product', name: '光落在建築裡',
    price: 680, stock: 3, featured: false, badge: '建築選書',
    summary: '從陰影、材質與尺度理解住宅採光。',
    description: '大開本攝影與圖說保存良好，適合空間設計工作者收藏。',
    images: [image('photo-1487958449943-2429e8be8625')], tags: ['建築', '光影', '攝影'],
    details: { condition: '近全新', author: '藤井直', publisher: '間社', year: '2022' }
  },
  {
    id: 'book-quiet-objects', category: 'books', kind: 'product', name: '安靜的器物',
    price: 520, stock: 4, featured: false, badge: '生活選書',
    summary: '十二位工藝家的器物與日常訪談。',
    description: '書況良好，收錄陶器、木工與金工創作者的工作現場。',
    images: [image('photo-1610701596007-11502861dcfa')], tags: ['工藝', '器物', '訪談'],
    details: { condition: '良好', author: '小林真紀', publisher: '器日', year: '2019' }
  },
  {
    id: 'invite-washi-moon', category: 'invitations', kind: 'product', name: '月白和紙喜帖',
    price: 128, stock: 500, featured: true, badge: '可客製',
    summary: '纖維可見的月白和紙，搭配燙霧金月相。',
    description: '雙層和紙與棉紙信封組合，可調整姓名、日期與內文。售價為單份。',
    images: [image('photo-1519225421980-715cb0215aed'), image('photo-1606800052052-a08af7148866')], tags: ['和紙', '燙金', '婚禮'],
    details: { paper: '日本和紙 220g', size: '12 × 18 cm', minimum: '50 份', leadTime: '校稿確認後 18 個工作天' }
  },
  {
    id: 'invite-forest-letterpress', category: 'invitations', kind: 'product', name: '森影活版喜帖',
    price: 156, stock: 400, featured: true, badge: '活版印刷',
    summary: '森林綠油墨壓印厚棉紙，觸摸得到字的深度。',
    description: '以一色活版印刷呈現枝葉與文字，適合小型戶外婚禮。售價為單份。',
    images: [image('photo-1507501336603-6e31db2be093')], tags: ['活版', '森林', '棉紙'],
    details: { paper: '厚棉紙 450g', size: '13 × 18 cm', minimum: '60 份', leadTime: '校稿確認後 22 個工作天' }
  },
  {
    id: 'invite-wine-fold', category: 'invitations', kind: 'product', name: '酒紅折頁喜帖',
    price: 98, stock: 600, featured: false, badge: '經典款',
    summary: '低調酒紅封套，內頁以細線排版保留呼吸。',
    description: '三折式資訊設計，能容納婚宴流程、地圖與回覆方式。售價為單份。',
    images: [image('photo-1511285560929-80b456fea0bc')], tags: ['酒紅', '折頁', '極簡'],
    details: { paper: '美術紙 300g', size: '10 × 20 cm', minimum: '50 份', leadTime: '校稿確認後 14 個工作天' }
  },
  {
    id: 'invite-blue-vellum', category: 'invitations', kind: 'product', name: '倫敦藍描圖喜帖',
    price: 118, stock: 450, featured: false, badge: '半透明層次',
    summary: '深藍卡紙覆上描圖紙，像霧裡亮起的城市燈。',
    description: '描圖紙可印單色肖像或場地線稿，搭配深藍信封。售價為單份。',
    images: [image('photo-1519741497674-611481863552')], tags: ['倫敦藍', '描圖紙', '城市'],
    details: { paper: '描圖紙＋深藍卡 300g', size: '12 × 17 cm', minimum: '50 份', leadTime: '校稿確認後 16 個工作天' }
  },
  {
    id: 'interior-rain-courtyard', category: 'interiors', kind: 'service', name: '雨庭町屋｜老屋再生',
    price: 0, stock: 0, featured: true, badge: '住宅案例',
    summary: '以一道內庭把日光與雨聲重新帶回四十年街屋。',
    description: '保留磨石子地坪與木構，透過內庭、拉門和連續收納重整三代同堂的生活。',
    images: [image('photo-1600607687920-4e2a09cf159d'), image('photo-1600566753190-17f0baa2a6c3')], tags: ['老屋', '侘寂', '採光'],
    details: { spaceType: '三代住宅', area: '32 坪', style: '町屋侘寂', service: '預約初談' }
  },
  {
    id: 'interior-blue-study', category: 'interiors', kind: 'service', name: '藍墨書房｜小宅收納',
    price: 0, stock: 0, featured: true, badge: '小宅案例',
    summary: '用一面倫敦藍書牆，整理閱讀、工作與收藏。',
    description: '把走道轉化為藏書牆，折疊桌讓工作模式能在晚餐前收起。',
    images: [image('photo-1600210492486-724fe5c67fb0')], tags: ['小宅', '書房', '收納'],
    details: { spaceType: '單人住宅', area: '16 坪', style: '都會日系', service: '預約初談' }
  },
  {
    id: 'interior-tea-corner', category: 'interiors', kind: 'service', name: '茶隅之家｜留白住宅',
    price: 0, stock: 0, featured: false, badge: '住宅案例',
    summary: '把窗邊的一坪留給茶、晨光與沒有安排的時間。',
    description: '降低固定隔間，以布簾、家具與光線建立彈性邊界。',
    images: [image('photo-1600566753086-00f18fb6b3ea')], tags: ['留白', '茶席', '木質'],
    details: { spaceType: '夫妻住宅', area: '24 坪', style: '自然日系', service: '預約初談' }
  },
  {
    id: 'interior-wine-bistro', category: 'interiors', kind: 'service', name: '葡萄枝小店｜餐飲空間',
    price: 0, stock: 0, featured: false, badge: '商業案例',
    summary: '酒紅牆面與舊木桌，讓十二席小店有夜晚的深度。',
    description: '有限預算下保留原始牆面，以燈光與回收家具建立親密尺度。',
    images: [image('photo-1552566626-52f8b828add9')], tags: ['餐飲', '酒紅', '舊木'],
    details: { spaceType: '餐飲空間', area: '18 坪', style: '日式洋食屋', service: '預約初談' }
  },
  {
    id: 'goods-ceramic-cup', category: 'goods', kind: 'product', name: '灰釉手捏杯',
    price: 780, stock: 6, featured: true, badge: '手作器物',
    summary: '杯緣略帶起伏，每一只都有不同落灰。',
    description: '適合日常茶飲與咖啡，手工尺寸略有差異。',
    images: [image('photo-1578749556568-bc2c40e68b61')], tags: ['陶器', '茶杯', '手作'],
    details: { material: '陶土、灰釉', size: '約 Ø8 × H7 cm', origin: '日本岐阜', care: '可使用洗碗機' }
  },
  {
    id: 'goods-brass-tray', category: 'goods', kind: 'product', name: '黃銅葉形小盤',
    price: 620, stock: 8, featured: true, badge: '自然氧化',
    summary: '收納戒指、香錐或桌邊的小小零件。',
    description: '未上透明漆，使用後會留下屬於自己的氧化色澤。',
    images: [image('photo-1618220179428-22790b461013')], tags: ['黃銅', '收納', '香器'],
    details: { material: '黃銅', size: '12 × 6 cm', origin: '台灣', care: '以乾布擦拭' }
  },
  {
    id: 'goods-linen-cloth', category: 'goods', kind: 'product', name: '森林亞麻方巾',
    price: 340, stock: 12, featured: false, badge: '日常織品',
    summary: '吸水後更柔軟的深綠亞麻，可作餐巾或包布。',
    description: '四邊細密車縫，洗後自然皺褶即是亞麻的表情。',
    images: [image('photo-1604014237800-1c9102c219da')], tags: ['亞麻', '方巾', '森林綠'],
    details: { material: '100% 亞麻', size: '45 × 45 cm', origin: '立陶宛', care: '冷水柔洗' }
  },
  {
    id: 'goods-wood-brush', category: 'goods', kind: 'product', name: '山毛櫸衣物刷',
    price: 890, stock: 5, featured: false, badge: '長久使用',
    summary: '用天然鬃毛整理大衣與針織，減少頻繁清洗。',
    description: '握柄保留山毛櫸細緻木紋，附棉布收納袋。',
    images: [image('photo-1527515637462-cff94eecc1ac')], tags: ['木工', '清潔', '衣物'],
    details: { material: '山毛櫸、天然鬃毛', size: '26 × 4 cm', origin: '德國', care: '順毛清理、保持乾燥' }
  }
];
