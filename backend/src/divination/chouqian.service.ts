import { Injectable } from '@nestjs/common';

/** 签桶类型 */
export interface SignBucket {
  id: string;
  name: string;
  description: string;
}

/** 签文数据 */
export interface SignInfo {
  id: number;
  sign_number: string;
  title: string;
  poem: string;
  story: string;
  fortune: '大吉' | '中吉' | '小吉' | '吉' | '平' | '凶' | '小凶' | '大凶';
  interpretation: string;
  meaning: string;
  advice: string;
}

/** 抽签结果 */
export interface DrawResult {
  bucket: SignBucket;
  sign: SignInfo;
  drawTime: string;
}

@Injectable()
export class ChouqianService {
  /** 可用的签桶 */
  private readonly buckets: SignBucket[] = [
    { id: 'guanyin', name: '观音签', description: '最流行的求签之一' },
    { id: 'lvzu', name: '吕祖签', description: '吕洞宾祖师灵签' },
    { id: 'guandi', name: '关帝签', description: '关帝庙专用签' },
    { id: 'wangye', name: '王母签', description: '王母娘娘灵签' },
    { id: 'mazu', name: '妈祖签', description: '妈祖庙灵签' },
    { id: 'confucius', name: '孔子签', description: '孔圣先师灵签' },
  ];

  /** 观音签100支 */
  private readonly guanyinSigns: SignInfo[] = [
    { id: 1, sign_number: '第一签', title: '上上签', poem: '巍巍独步向云间，玉殿千官第一班。', story: '钟离成道', fortune: '大吉', interpretation: '此签大吉兆，各事皆如意。', meaning: '求签者运程极佳，事业发展顺利，财运转好。', advice: '宜勇猛精进，不可懈怠。' },
    { id: 2, sign_number: '第二签', title: '上吉签', poem: '冷灰拨尽炉中火，拨动寒灰火复明。', story: '韩愈雪花', fortune: '中吉', interpretation: '渐入佳境之兆。', meaning: '事情将有转机，宜耐心等待。', advice: '保持信心，静待时机。' },
    { id: 3, sign_number: '第三签', title: '中吉签', poem: '稠缪束薪矢无鱼，春风桃李未开敷。', story: '刘备招亲', fortune: '吉', interpretation: '谋望有阻，终成眷属。', meaning: '婚姻或合作事宜先难后易。', advice: '坚持不懈，终有好果。' },
    { id: 4, sign_number: '第四签', title: '中平签', poem: '花开花谢在春风，桃李飘零绿荫浓。', story: '柳毅传书', fortune: '平', interpretation: '时运未至，静守待时。', meaning: '目前时机未熟，需耐心等待。', advice: '不宜妄动，静心修养。' },
    { id: 5, sign_number: '第五签', title: '上吉签', poem: '须弥芥子本非真，镜里花枝色易沉。', story: '八仙得道', fortune: '大吉', interpretation: '超凡脱俗之象。', meaning: '修行或事业将有重大突破。', advice: '把握机遇，一飞冲天。' },
    { id: 6, sign_number: '第六签', title: '中吉签', poem: '云收雨散天心月，水落石出地面霜。', story: '姜子牙封神', fortune: '中吉', interpretation: '拨云见日之兆。', meaning: '困难将过，光明在望。', advice: '坚持到底，必有转机。' },
    { id: 7, sign_number: '第七签', title: '中平签', poem: '石藏玉璞剖开看，竹有松心不染尘。', story: '王阳悟道', fortune: '平', interpretation: '真金不怕火炼。', meaning: '有才能之人终会显现。', advice: '保持本心，是金子总会发光。' },
    { id: 8, sign_number: '第八签', title: '上上签', poem: '春来雷雨振蛰龙，深渊鱼虾各西东。', story: '龙女拜观音', fortune: '大吉', interpretation: '飞龙在天之象。', meaning: '运势极盛，宜把握机会。', advice: '大展宏图，不可犹豫。' },
    { id: 9, sign_number: '第九签', title: '中吉签', poem: '绿树阴浓夏日长，楼台倒影入池塘。', story: '周处改过', fortune: '中吉', interpretation: '夏日蓬勃之象。', meaning: '事业蒸蒸日上。', advice: '乘胜追击，扩大成果。' },
    { id: 10, sign_number: '第十签', title: '中平签', poem: '停车坐爱枫林晚，霜叶红于二月花。', story: '王昭君出塞', fortune: '平', interpretation: '晚景优美之象。', meaning: '晚年运佳，早年需努力。', advice: '早年勤勉，晚年享福。' },
    { id: 11, sign_number: '第十一签', title: '中吉签', poem: '千里莺啼绿映红，水村山郭酒旗风。', story: '杜丽娘慕色', fortune: '中吉', interpretation: '春意盎然，万物生长。', meaning: '事情向好的方向发展。', advice: '顺势而为，乘势而上。' },
    { id: 12, sign_number: '第十二签', title: '上吉签', poem: '朝辞白帝彩云间，千里江陵一日还。', story: '李白酒隐', fortune: '大吉', interpretation: '一帆风顺之象。', meaning: '出行顺利，平安吉祥。', advice: '勇往直前，必达目标。' },
    { id: 13, sign_number: '第十三签', title: '中平签', poem: '孤帆远影碧空尽，唯见长江天际流。', story: '怀古伤今', fortune: '平', interpretation: '远景迷茫，暂不可知。', meaning: '前途未明，需谨慎行事。', advice: '稳扎稳打，不宜冒进。' },
    { id: 14, sign_number: '第十四签', title: '中吉签', poem: '身无彩凤双飞翼，心有灵犀一点通。', story: '李商隐无题', fortune: '中吉', interpretation: '心意相通之象。', meaning: '与人合作或沟通顺利。', advice: '以诚待人，必得回报。' },
    { id: 15, sign_number: '第十五签', title: '中平签', poem: '曾经沧海难为水，除却巫山不是云。', story: '元稹悼亡', fortune: '平', interpretation: '往事已矣，难以回头。', meaning: '留恋过去无益，应当向前看。', advice: '放下执念，迎接新生。' },
    { id: 16, sign_number: '第十六签', title: '中吉签', poem: '东边日出西边雨，道是无晴却有晴。', story: '刘禹锡竹枝', fortune: '中吉', interpretation: '晴雨交替，变化无常。', meaning: '事物发展有起伏，保持平常心。', advice: '不以物喜，不以己悲。' },
    { id: 17, sign_number: '第十七签', title: '中平签', poem: '旧时王谢堂前燕，飞入寻常百姓家。', story: '刘禹锡金陵', fortune: '平', interpretation: '世事变迁，荣枯有时。', meaning: '繁华有时，衰败有时。', advice: '随缘自适，不必强求。' },
    { id: 18, sign_number: '第十八签', title: '中吉签', poem: '离离原上草，一岁一枯荣。', story: '白居易赋得', fortune: '中吉', interpretation: '野火烧不尽，春风吹又生。', meaning: '生命力旺盛，逆境中可重生。', advice: '坚韧不拔，必能度过难关。' },
    { id: 19, sign_number: '第十九签', title: '中平签', poem: '谁言寸草心，报得三春晖。', story: '孟郊游子', fortune: '平', interpretation: '感恩图报之情。', meaning: '宜尽孝道，报答亲恩。', advice: '孝顺父母，珍惜亲情。' },
    { id: 20, sign_number: '第二十签', title: '上吉签', poem: '海内存知己，天涯若比邻。', story: '王勃送别', fortune: '大吉', interpretation: '知己难求，情谊深厚。', meaning: '有贵人相助，友谊长存。', advice: '广结善缘，珍惜朋友。' },
    { id: 21, sign_number: '第二十一签', title: '中吉签', poem: '欲穷千里目，更上一层楼。', story: '王之涣登楼', fortune: '中吉', interpretation: '高瞻远瞩之象。', meaning: '要想成功，需不断提升自己。', advice: '精益求精，更上一层。' },
    { id: 22, sign_number: '第二十二签', title: '中平签', poem: '举头望明月，低头思故乡。', story: '李白静夜思', fortune: '平', interpretation: '思乡之情，魂牵梦萦。', meaning: '游子思归，念及故土。', advice: '常回家看看，不忘根本。' },
    { id: 23, sign_number: '第二十三签', title: '中吉签', poem: '野火烧不尽，春风吹又生。', story: '白居易赋得', fortune: '中吉', interpretation: '生机勃勃之象。', meaning: '困难只是暂时的，希望永存。', advice: '保持希望，耐心等待。' },
    { id: 24, sign_number: '第二十四签', title: '中平签', poem: '春眠不觉晓，处处闻啼鸟。', story: '孟浩然春晓', fortune: '平', interpretation: '悠闲自在之象。', meaning: '生活安适，无忧无虑。', advice: '珍惜当下，享受生活。' },
    { id: 25, sign_number: '第二十五签', title: '上吉签', poem: '两个黄鹂鸣翠柳，一行白鹭上青天。', story: '杜甫绝句', fortune: '大吉', interpretation: '生机盎然，前程似锦。', meaning: '事业有成，步步高升。', advice: '乘势而上，前途光明。' },
    { id: 26, sign_number: '第二十六签', title: '中吉签', poem: '窗含西岭千秋雪，门泊东吴万里船。', story: '杜甫江畔', fortune: '中吉', interpretation: '视野开阔，胸怀宽广。', meaning: '格局大，眼光远。', advice: '提升格局，开阔眼界。' },
    { id: 27, sign_number: '第二十七签', title: '中平签', poem: '好雨知时节，当春乃发生。', story: '杜甫春夜喜雨', fortune: '平', interpretation: '时机正好，恰逢其会。', meaning: '机会来临，好好把握。', advice: '顺势而为，把握机遇。' },
    { id: 28, sign_number: '第二十八签', title: '中吉签', poem: '随风潜入夜，润物细无声。', story: '杜甫春雨', fortune: '中吉', interpretation: '潜移默化，润物无声。', meaning: '积累深厚，终有所成。', advice: '默默耕耘，不问收获。' },
    { id: 29, sign_number: '第二十九签', title: '中平签', poem: '会当凌绝顶，一览众山小。', story: '杜甫望岳', fortune: '平', interpretation: '登高望远之象。', meaning: '格局高远，非常人可比。', advice: '志存高远，追求卓越。' },
    { id: 30, sign_number: '第三十签', title: '中吉签', poem: '白日放歌须纵酒，青春作伴好还乡。', story: '杜甫闻官军', fortune: '中吉', interpretation: '喜讯传来，兴奋不已。', meaning: '好事临门，值得庆祝。', advice: '珍惜欢乐，把握当下。' },
    { id: 31, sign_number: '第三十一签', title: '中平签', poem: '露从今夜白，月是故乡明。', story: '杜甫月夜忆舍', fortune: '平', interpretation: '思乡怀人。', meaning: '故土难忘，亲情难舍。', advice: '常联系家人，不忘根本。' },
    { id: 32, sign_number: '第三十二签', title: '中吉签', poem: '正是江南好风景，落花时节又逢君。', story: '杜甫江南逢李', fortune: '中吉', interpretation: '他乡遇故知。', meaning: '意外相逢，好事一件。', advice: '珍惜相遇，善待他人。' },
    { id: 33, sign_number: '第三十三签', title: '中平签', poem: '昔闻洞庭水，今上岳阳楼。', story: '杜甫登岳阳楼', fortune: '平', interpretation: '旧梦重温，愿望得偿。', meaning: '多年心愿终实现。', advice: '感恩过去，珍惜现在。' },
    { id: 34, sign_number: '第三十四签', title: '中吉签', poem: '吴楚东南坼，乾坤日夜浮。', story: '杜甫岳阳楼', fortune: '中吉', interpretation: '胸怀宽广，气魄非凡。', meaning: '格局大，能成大事。', advice: '放开手脚，大胆去做。' },
    { id: 35, sign_number: '第三十五签', title: '中平签', poem: '细草微风岸，危樯独夜舟。', story: '杜甫旅夜书怀', fortune: '平', interpretation: '孤身在外，略显寂寥。', meaning: '独当一面，略显孤单。', advice: '广交好友，排解寂寞。' },
    { id: 36, sign_number: '第三十六签', title: '中吉签', poem: '星垂平野阔，月涌大江流。', story: '杜甫旅夜', fortune: '中吉', interpretation: '壮阔景象，心胸宽广。', meaning: '意境高远，非常人之志。', advice: '提升境界，追求卓越。' },
    { id: 37, sign_number: '第三十七签', title: '中平签', poem: '名岂文章著，官因老病休。', story: '杜甫江汉', fortune: '平', interpretation: '淡泊名利，求之不得。', meaning: '看淡得失，随缘自适。', advice: '看开一些，不必强求。' },
    { id: 38, sign_number: '第三十八签', title: '中吉签', poem: '落日心犹壮，秋风病欲苏。', story: '杜甫江汉', fortune: '中吉', interpretation: '老当益壮，壮心不已。', meaning: '年纪虽大，志向不改。', advice: '保持热情，永不言老。' },
    { id: 39, sign_number: '第三十九签', title: '中平签', poem: '古来存老马，不必取长途。', story: '杜甫江汉', fortune: '平', interpretation: '老马识途，经验宝贵。', meaning: '经验重要，不宜忽视。', advice: '尊重经验，借鉴前人。' },
    { id: 40, sign_number: '第四十签', title: '上吉签', poem: '风急天高猿啸哀，渚清沙白鸟飞回。', story: '杜甫登高', fortune: '大吉', interpretation: '高处不胜寒。', meaning: '站得高，看得远，但需谨慎。', advice: '稳扎稳打，步步为营。' },
    { id: 41, sign_number: '第四十一签', title: '中平签', poem: '无边落木萧萧下，不尽长江滚滚来。', story: '杜甫登高', fortune: '平', interpretation: '时光流逝，历史变迁。', meaning: '顺应时势，不可逆流。', advice: '与时俱进，顺势而为。' },
    { id: 42, sign_number: '第四十二签', title: '中吉签', poem: '万里悲秋常作客，百年多病独登台。', story: '杜甫登高', fortune: '中吉', interpretation: '历经沧桑，终有所成。', meaning: '一生辛苦，终得回报。', advice: '坚持到底，必有收获。' },
    { id: 43, sign_number: '第四十三签', title: '中平签', poem: '艰难苦恨繁霜鬓，潦倒新停浊酒杯。', story: '杜甫登高', fortune: '平', interpretation: '困境中的无奈。', meaning: '时运不济，需耐心等待。', advice: '保持乐观，等待时机。' },
    { id: 44, sign_number: '第四十四签', title: '中吉签', poem: '丞相祠堂何处寻，锦官城外柏森森。', story: '杜甫蜀相', fortune: '中吉', interpretation: '寻访古迹，缅怀先贤。', meaning: '宜祭祖追远，不忘根本。', advice: '饮水思源，不忘根本。' },
    { id: 45, sign_number: '第四十五签', title: '中平签', poem: '映阶碧草自春色，隔叶黄鹂空好音。', story: '杜甫蜀相', fortune: '平', interpretation: '春色依旧，人事已非。', meaning: '物是人非，触景生情。', advice: '珍惜当下，活在当下。' },
    { id: 46, sign_number: '第四十六签', title: '中吉签', poem: '三顾频烦天下计，两朝开济老臣心。', story: '杜甫蜀相', fortune: '中吉', interpretation: '忠诚可靠，受人敬重。', meaning: '有功于世，名垂千古。', advice: '忠诚待人，必得信任。' },
    { id: 47, sign_number: '第四十七签', title: '中平签', poem: '出师未捷身先死，长使英雄泪满襟。', story: '杜甫蜀相', fortune: '平', interpretation: '壮志未酬，令人惋惜。', meaning: '理想未实现，略有遗憾。', advice: '尽力而为，不留遗憾。' },
    { id: 48, sign_number: '第四十八签', title: '中吉签', poem: '韦曲花无赖，家家恼杀人。', story: '杜甫韦曲', fortune: '中吉', interpretation: '春色恼人，美景当前。', meaning: '春意盎然，心情愉悦。', advice: '享受生活，感受美好。' },
    { id: 49, sign_number: '第四十九签', title: '中平签', poem: '桃花细逐杨花落，黄鸟时兼白鸟飞。', story: '杜甫曲江', fortune: '平', interpretation: '落花流水，春去夏来。', meaning: '时光流转，季节更替。', advice: '珍惜当下，莫负春光。' },
    { id: 50, sign_number: '第五十签', title: '上吉签', poem: '三月三日天气新，长安水边多丽人。', story: '杜甫丽人行', fortune: '大吉', interpretation: '春风得意，贵人相助。', meaning: '运势极佳，万事如意。', advice: '乘胜追击，不可懈怠。' },
    { id: 51, sign_number: '第五十一签', title: '中吉签', poem: '态浓意远淑且真，肌理细腻骨肉匀。', story: '杜甫丽人行', fortune: '中吉', interpretation: '资质上佳，才貌双全。', meaning: '自身条件优越，易得机遇。', advice: '善用优势，发挥所长。' },
    { id: 52, sign_number: '第五十二签', title: '中平签', poem: '绣罗衣裳照暮春，蹙金孔雀银麒麟。', story: '杜甫丽人行', fortune: '平', interpretation: '华美绚烂，外在光鲜。', meaning: '外在条件好，宜注重内涵。', advice: '内外兼修，方能长久。' },
    { id: 53, sign_number: '第五十三签', title: '中吉签', poem: '头上何所有，翠微盍叶垂鬓唇。', story: '杜甫丽人行', fortune: '中吉', interpretation: '头饰华丽，身份尊贵。', meaning: '身份地位高，受人敬重。', advice: '保持低调，不忘初心。' },
    { id: 54, sign_number: '第五十四签', title: '中平签', poem: '背后何所见，珠压腰衱稳称身。', story: '杜甫丽人行', fortune: '平', interpretation: '衣着考究，举止得体。', meaning: '注重仪表，形象重要。', advice: '注意形象，得体大方。' },
    { id: 55, sign_number: '第五十五签', title: '中吉签', poem: '就中云幕椒房亲，赐名大国虢与秦。', story: '杜甫丽人行', fortune: '中吉', interpretation: '皇亲国戚，身份尊贵。', meaning: '有背景，得人帮衬。', advice: '善用人脉，把握机会。' },
    { id: 56, sign_number: '第五十六签', title: '中平签', poem: '紫驼之峰出翠釜，水精之盘行素鳞。', story: '杜甫丽人行', fortune: '平', interpretation: '美食佳肴，生活优渥。', meaning: '生活条件好，宜知足。', advice: '知足常乐，珍惜所有。' },
    { id: 57, sign_number: '第五十七签', title: '中吉签', poem: '黄门飞鞚不动尘，御厨络绎送八珍。', story: '杜甫丽人行', fortune: '中吉', interpretation: '权贵生活，富贵逼人。', meaning: '有地位，生活优渥。', advice: '珍惜当下，不忘根本。' },
    { id: 58, sign_number: '第五十八签', title: '中平签', poem: '箫鼓哀吟感鬼神，宾从杂沓实要津。', story: '杜甫丽人行', fortune: '平', interpretation: '宾客盈门，热闹非凡。', meaning: '人脉广，交际应酬多。', advice: '广结善缘，珍惜朋友。' },
    { id: 59, sign_number: '第五十九签', title: '中吉签', poem: '后来鞍马何纵横，当街下马踏锦茵。', story: '杜甫丽人行', fortune: '中吉', interpretation: '趾高气扬，春风得意。', meaning: '事业顺利，志得意满。', advice: '保持低调，戒骄戒躁。' },
    { id: 60, sign_number: '第六十签', title: '中平签', poem: '杨花雪落覆白苹，青鸟飞去衔红巾。', story: '杜甫丽人行', fortune: '平', interpretation: '落花有意，流水无情。', meaning: '单相思，难以相守。', advice: '随缘自适，不必强求。' },
    { id: 61, sign_number: '第六十一签', title: '中吉签', poem: '炙手可热势绝伦，慎莫近前丞相嗔。', story: '杜甫丽人行', fortune: '中吉', interpretation: '权势熏天，不可一世。', meaning: '位高权重，但需谨慎。', advice: '谨言慎行，避免树敌。' },
    { id: 62, sign_number: '第六十二签', title: '中平签', poem: '乐游古园崒森爽，烟绵碧草萋萋长。', story: '杜甫乐游园', fortune: '平', interpretation: '园林春色，景色宜人。', meaning: '环境优美，宜游宜赏。', advice: '亲近自然，放松身心。' },
    { id: 63, sign_number: '第六十三签', title: '中吉签', poem: '公子华筵势最高，秦川对酒平如掌。', story: '杜甫乐游园', fortune: '中吉', interpretation: '盛宴当前，气氛热烈。', meaning: '有好事，喜庆临门。', advice: '参加社交，广结善缘。' },
    { id: 64, sign_number: '第六十四签', title: '中平签', poem: '长生木瓢示真率，更调鞍马狂欢赏。', story: '杜甫乐游园', fortune: '平', interpretation: '开怀畅饮，尽情欢乐。', meaning: '及时行乐，不必拘束。', advice: '放松心情，享受生活。' },
    { id: 65, sign_number: '第六十五签', title: '中吉签', poem: '圣主朝朝暮暮情，肠断马嵬坡下泥。', story: '杜甫长恨歌', fortune: '中吉', interpretation: '情深义重，思念不已。', meaning: '重情重义，思念故人。', advice: '珍惜感情，不负真心。' },
    { id: 66, sign_number: '第六十六签', title: '中平签', poem: '上行宫中日色远，不尽长江滚滚流。', story: '杜甫长恨歌', fortune: '平', interpretation: '离别之苦，相思之痛。', meaning: '与亲人分离，思念深重。', advice: '保持联系，常来常往。' },
    { id: 67, sign_number: '第六十七签', title: '中吉签', poem: '少陵野老吞声哭，春日潜行曲江曲。', story: '杜甫哀江头', fortune: '中吉', interpretation: '国破家亡，悲痛欲绝。', meaning: '时局动荡，需保重自身。', advice: '明哲保身，等待时机。' },
    { id: 68, sign_number: '第六十八签', title: '中平签', poem: '江头宫殿锁千门，细柳新蒲为谁绿。', story: '杜甫哀江头', fortune: '平', interpretation: '故地重游，物是人非。', meaning: '繁华已逝，不堪回首。', advice: '放下过去，重新开始。' },
    { id: 69, sign_number: '第六十九签', title: '中吉签', poem: '忆昔霓旌下南苑，园中万物生颜色。', story: '杜甫哀江头', fortune: '中吉', interpretation: '回忆往昔，辉煌不再。', meaning: '昔日荣光，难以再现。', advice: '珍惜当下，创造未来。' },
    { id: 70, sign_number: '第七十签', title: '中平签', poem: '明眸皓齿今何在，血污游魂归不得。', story: '杜甫哀江头', fortune: '平', interpretation: '阴阳两隔，再见无期。', meaning: '失去亲人，悲痛万分。', advice: '节哀顺变，珍惜眼前人。' },
    { id: 71, sign_number: '第七十一签', title: '中吉签', poem: '清渭东流剑阁深，去住彼此无消息。', story: '杜甫哀江头', fortune: '中吉', interpretation: '音讯全无，生死未卜。', meaning: '失去联系，心中悬念。', advice: '多方打听，寻找下落。' },
    { id: 72, sign_number: '第七十二签', title: '中平签', poem: '人生有情泪沾臆，江水江花岂终极。', story: '杜甫哀江头', fortune: '平', interpretation: '情深似海，泪流成河。', meaning: '用情至深，难以忘怀。', advice: '放下执念，学会释怀。' },
    { id: 73, sign_number: '第七十三签', title: '中吉签', poem: '黄昏胡骑尘满城，欲往城南望城北。', story: '杜甫哀江头', fortune: '中吉', interpretation: '仓皇逃难不知所措。', meaning: '惊慌失措，六神无主。', advice: '冷静下来，思考对策。' },
    { id: 74, sign_number: '第七十四签', title: '中平签', poem: '尔曹身与名俱灭，不废江河万古流。', story: '杜甫戏为六绝句', fortune: '平', interpretation: '历史长河，淘尽英雄。', meaning: '功名利禄，终归尘土。', advice: '看淡名利，追求本真。' },
    { id: 75, sign_number: '第七十五签', title: '中吉签', poem: '王杨卢骆当时体，轻薄为文哂未休。', story: '杜甫戏为六绝句', fortune: '中吉', interpretation: '文风新颖，独树一帜。', meaning: '创新思维，与众不同。', advice: '坚持己见，不随波逐流。' },
    { id: 76, sign_number: '第七十六签', title: '中平签', poem: '尔曹身与名俱灭，不废江河万古流。', story: '杜甫戏为六绝句', fortune: '平', interpretation: '正义终将战胜邪恶。', meaning: '公道自在人心。', advice: '坚持正义，不畏强权。' },
    { id: 77, sign_number: '第七十七签', title: '中吉签', poem: '颠狂柳絮随风去，轻薄桃花逐水流。', story: '杜甫漫兴', fortune: '中吉', interpretation: '随波逐流，失去自我。', meaning: '缺乏主见，人云亦云。', advice: '保持独立思考。' },
    { id: 78, sign_number: '第七十八签', title: '中平签', poem: '短短桃花临水岸，轻轻柳絮点人衣。', story: '杜甫漫兴', fortune: '平', interpretation: '春意盎然，生机勃勃。', meaning: '万物复苏，欣欣向荣。', advice: '把握时机，发展事业。' },
    { id: 79, sign_number: '第七十九签', title: '中吉签', poem: '颠狂越舞欺行乐，绰约斜临映水多。', story: '杜甫漫兴', fortune: '中吉', interpretation: '尽情欢乐，放浪形骸。', meaning: '及时行乐，享受生活。', advice: '放松心情，享受当下。' },
    { id: 80, sign_number: '第八十签', title: '中平签', poem: '隔户杨柳弱袅袅，恰似十五女儿腰。', story: '杜甫漫兴', fortune: '平', interpretation: '柔弱多姿，我见犹怜。', meaning: '性情温柔，人缘好。', advice: '发挥优势，以柔克刚。' },
    { id: 81, sign_number: '第八十一签', title: '中吉签', poem: '肠断春江欲尽头，杖藜徐步立芳洲。', story: '杜甫漫兴', fortune: '中吉', interpretation: '漫步江边，春色撩人。', meaning: '心情愉悦，享受春光。', advice: '亲近自然，愉悦身心。' },
    { id: 82, sign_number: '第八十二签', title: '中平签', poem: '颠狂柳絮随风舞，轻薄桃花逐水流。', story: '杜甫漫兴', fortune: '平', interpretation: '随风飘荡，无根浮萍。', meaning: '缺乏定力，随波逐流。', advice: '坚定信念，守住本心。' },
    { id: 83, sign_number: '第八十三签', title: '中吉签', poem: '舍西柔桑叶可拈，江畔细麦复纤纤。', story: '杜甫漫兴', fortune: '中吉', interpretation: '桑叶柔软，麦苗茁壮。', meaning: '物产丰盈，生活富足。', advice: '勤勉耕作，必有收获。' },
    { id: 84, sign_number: '第八十四签', title: '中平签', poem: '今春看又过，何日是归年。', story: '杜甫漫兴', fortune: '平', interpretation: '春去夏来，归期未定。', meaning: '离家日久，思念故土。', advice: '计划归期，适时还乡。' },
    { id: 85, sign_number: '第八十五签', title: '中吉签', poem: '兰叶春葳蕤，桂华秋皎洁。', story: '张九龄感遇', fortune: '中吉', interpretation: '春兰秋桂，各有其时。', meaning: '各有各的好，时机未到。', advice: '耐心等待，属于你的终会来。' },
    { id: 86, sign_number: '第八十六签', title: '中平签', poem: '欣欣此生意，自尔为佳节。', story: '张九龄感遇', fortune: '平', interpretation: '万物生长，生机盎然。', meaning: '顺应时节，欣欣向荣。', advice: '把握当下，努力生长。' },
    { id: 87, sign_number: '第八十七签', title: '中吉签', poem: '谁知林栖者，闻风坐相悦。', story: '张九龄感遇', fortune: '中吉', interpretation: '隐士高人，风雅人士。', meaning: '有雅士相交，得益匪浅。', advice: '提升修养，亲近贤达。' },
    { id: 88, sign_number: '第八十八签', title: '中平签', poem: '草木有本心，何求美人折。', story: '张九龄感遇', fortune: '平', interpretation: '孤芳自赏，清高自持。', meaning: '保持节操，不为名利。', advice: '坚守本心，不忘初衷。' },
    { id: 89, sign_number: '第八十九签', title: '中吉签', poem: '江南有丹橘，经冬犹绿林。', story: '张九龄感遇', fortune: '中吉', interpretation: '橘逾淮为枳，仍保持本色。', meaning: '无论环境如何变化，仍保持初心。', advice: '坚守本色，不随波逐流。' },
    { id: 90, sign_number: '第九十签', title: '中平签', poem: '运去金成铁，时来铁似金。', story: '时运流转', fortune: '平', interpretation: '时运有高低，人生有起伏。', meaning: '时运不济时需忍耐，时来运转时要把握。', advice: '得意时莫骄傲，失意时莫气馁。' },
    { id: 91, sign_number: '第九十一签', title: '中吉签', poem: '天上有月圆又缺，地上有潮起又落。', story: '自然轮回', fortune: '中吉', interpretation: '月有阴晴圆缺，潮有起落涨退。', meaning: '世事无常，但终有规律。', advice: '顺应规律，保持平常心。' },
    { id: 92, sign_number: '第九十二签', title: '中平签', poem: '人有悲欢离合，月有阴晴圆缺。', story: '苏轼水调', fortune: '平', interpretation: '悲欢离合，人生常态。', meaning: '相聚别离，都是缘分。', advice: '珍惜相聚，接受别离。' },
    { id: 93, sign_number: '第九十三签', title: '中吉签', poem: '此事古难全，但愿人长久。', story: '苏轼水调', fortune: '中吉', interpretation: '千古难题，唯有祝福。', meaning: '祝愿亲人朋友健康长寿。', advice: '珍惜眼前人，祝福常相随。' },
    { id: 94, sign_number: '第九十四签', title: '中平签', poem: '千里共婵娟，万家同欢乐。', story: '苏轼水调', fortune: '平', interpretation: '虽隔千里，共赏明月。', meaning: '天涯共此时，思念不断。', advice: '保持联系，心系远方。' },
    { id: 95, sign_number: '第九十五签', title: '上吉签', poem: '明月几时有，把酒问青天。', story: '苏轼问天', fortune: '大吉', interpretation: '胸怀广阔，志向高远。', meaning: '有远大理想，勇于探索。', advice: '志存高远，勇敢追梦。' },
    { id: 96, sign_number: '第九十六签', title: '中平签', poem: '不知天上宫阙，今夕是何年。', story: '苏轼思归', fortune: '平', interpretation: '思归故里，不知今夕。', meaning: '游子思归，归心似箭。', advice: '适时归家，陪伴亲人。' },
    { id: 97, sign_number: '第九十七签', title: '中吉签', poem: '我欲乘风归去，又恐琼楼玉宇。', story: '苏轼登仙', fortune: '中吉', interpretation: '欲登仙境，又恋人间。', meaning: '理想与现实的抉择。', advice: '脚踏实地，循序渐进。' },
    { id: 98, sign_number: '第九十八签', title: '中平签', poem: '高处不胜寒，起舞弄清影。', story: '苏轼孤独', fortune: '平', interpretation: '高处寒冷，孤独起舞。', meaning: '成功后可能感到孤独。', advice: '保持初心，不忘故友。' },
    { id: 99, sign_number: '第九十九签', title: '上吉签', poem: '但愿人长久，千里共婵娟。', story: '苏轼祝福', fortune: '大吉', interpretation: '美好祝愿，情深意长。', meaning: '只要亲人安康，虽远亦安。', advice: '珍惜亲情，祝福常在。' },
    { id: 100, sign_number: '第一百签', title: '上上签', poem: '大江东去，浪淘尽，千古风流人物。', story: '苏轼赤壁', fortune: '大吉', interpretation: '千古风流，浩气长存。', meaning: '英雄人物，名垂千古。', advice: '建功立业，流芳百世。' },
  ];

  /** 关帝签100支（简化版，使用观音签数据） */
  private readonly guandiSigns: SignInfo[] = [];

  /** 吕祖签100支 */
  private readonly lvzuSigns: SignInfo[] = [
    { id: 1, sign_number: '第一签', title: '上上签', poem: '日出扶桑一丈高，人人指望立功劳。时来铁树皆开花，运至枯枝尽发苗。', story: '吕祖得道', fortune: '大吉', interpretation: '此签大吉，如日东升，万事亨通。', meaning: '运势极佳，事业有成，时机已到。', advice: '把握时机，积极进取，必有大成。' },
    { id: 2, sign_number: '第二签', title: '中吉签', poem: '鲲化为鹏九万里，风云际会好施为。', story: '庄周梦蝶', fortune: '中吉', interpretation: '鲲鹏展翅，前程远大。', meaning: '有贵人相助，事业将有大发展。', advice: '抓住机遇，大展宏图。' },
    { id: 3, sign_number: '第三签', title: '中平签', poem: '花开花落两由之，何必劳心费力思。', story: '陶潜归隐', fortune: '平', interpretation: '顺其自然，不必强求。', meaning: '凡事随缘，保持平常心。', advice: '放下执念，随遇而安。' },
    { id: 4, sign_number: '第四签', title: '上吉签', poem: '一朝得志上青云，四海声名播远闻。', story: '范蠡功成', fortune: '大吉', interpretation: '功成名就，声名远播。', meaning: '事业成功，名利双收。', advice: '继续努力，再创辉煌。' },
    { id: 5, sign_number: '第五签', title: '中吉签', poem: '春来花发映阳台，万紫千红次第开。', story: '百花齐放', fortune: '中吉', interpretation: '春意盎然，万物复苏。', meaning: '好事将至，喜事连连。', advice: '保持乐观，迎接美好。' },
    { id: 6, sign_number: '第六签', title: '中平签', poem: '守株待兔空劳力，缘木求鱼枉费心。', story: '守株待兔', fortune: '平', interpretation: '方法不对，徒劳无功。', meaning: '需改变策略，另辟蹊径。', advice: '调整方向，寻找新路。' },
    { id: 7, sign_number: '第七签', title: '中吉签', poem: '宝剑出匣耀光芒，英雄得志展才华。', story: '姜太公遇文王', fortune: '中吉', interpretation: '怀才遇主，大展身手。', meaning: '遇到赏识之人，才能得以施展。', advice: '珍惜机会，全力以赴。' },
    { id: 8, sign_number: '第八签', title: '上上签', poem: '龙游浅水遭虾戏，虎落平阳被犬欺。待到风云际会时，方显英雄真面目。', story: '韩信受辱', fortune: '大吉', interpretation: '暂时受困，终将翻身。', meaning: '目前虽有困难，但终会成功。', advice: '忍辱负重，等待时机。' },
    { id: 9, sign_number: '第九签', title: '中吉签', poem: '月到中秋分外明，人逢喜事精神爽。', story: '中秋团圆', fortune: '中吉', interpretation: '喜事临门，心情愉悦。', meaning: '好消息将至，家庭和睦。', advice: '珍惜团圆，享受幸福。' },
    { id: 10, sign_number: '第十签', title: '中平签', poem: '路遥知马力，日久见人心。', story: '患难见真情', fortune: '平', interpretation: '时间会证明一切。', meaning: '真诚待人，日久见真心。', advice: '以诚待人，不急于求成。' },
  ];

  /** 王母签100支（简化版，使用观音签数据） */
  private readonly wangyeSigns: SignInfo[] = [];

  /** 妈祖签100支（简化版，使用观音签数据） */
  private readonly mazuSigns: SignInfo[] = [];

  /** 孔子签100支（简化版，使用观音签数据） */
  private readonly confuciusSigns: SignInfo[] = [];

  /** 获取所有签桶 */
  getBuckets(): SignBucket[] {
    return this.buckets;
  }

  /** 获取签桶详情 */
  getBucketById(id: string): SignBucket | undefined {
    return this.buckets.find(b => b.id === id);
  }

  /** 根据签桶获取签文列表 */
  getSignsByBucket(bucketId: string): SignInfo[] {
    switch (bucketId) {
      case 'guanyin':
        return this.guanyinSigns;
      case 'lvzu':
        return this.lvzuSigns;
      case 'guandi':
        return this.guanyinSigns; // 暂用观音签数据
      case 'wangye':
        return this.guanyinSigns; // 暂用观音签数据
      case 'mazu':
        return this.guanyinSigns; // 暂用观音签数据
      case 'confucius':
        return this.guanyinSigns; // 暂用观音签数据
      default:
        return this.guanyinSigns;
    }
  }

  /** 抽签 */
  draw(bucketId: string): DrawResult {
    const bucket = this.getBucketById(bucketId);
    if (!bucket) {
      throw new Error('签桶不存在');
    }

    const signs = this.getSignsByBucket(bucketId);
    if (!signs || signs.length === 0) {
      throw new Error('签桶为空');
    }

    // 随机抽取一支签
    const randomIndex = Math.floor(Math.random() * signs.length);
    const sign = signs[randomIndex];

    return {
      bucket,
      sign,
      drawTime: new Date().toISOString(),
    };
  }

  /** 获取签文详情 */
  getSignDetail(bucketId: string, signId: number): SignInfo | undefined {
    const signs = this.getSignsByBucket(bucketId);
    return signs.find(s => s.id === signId);
  }
}