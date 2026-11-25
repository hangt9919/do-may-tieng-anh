// Lời thoại, meme, câu dọa. Câu kiểu "roast" đã được thu giọng sẵn (public/voice/), sửa chữ ở đây thì
// phải thu lại (node tools/build-voice.js). Câu chưa có file thu sẵn sẽ được đọc bằng giọng máy.
"use strict";

const LINES = {
  roast: {
    home: ["Vô đây tao đố. Sai là tao chửi đó nha.", "Hôm nay học hay lại để tao chửi?", "Tiếng Anh của mày tới đâu rồi, vô tao kiểm tra.", "Chơi đi, tao đang ngứa miệng."],
    prompt: ["Câu này dễ, đừng làm tao thất vọng.", "Đọc kỹ đề giùm tao cái.", "Tập trung vào, đừng có bấm bừa.", "Câu tiếp. Não đâu rồi, bật lên.", "Câu này mà sai thì tao nghỉ chơi.", "Nghĩ đi, tao chờ.", "Lần này cho tao tí hy vọng coi."],
    wrong: ["Ngu thế mày!", "Trời ơi, câu này con nít lớp ba cũng làm được.", "Mày học tiếng Anh hay tiếng ngoài hành tinh vậy?", "Sai. Mà sai một cách rất tự tin. Tao nể.", "Tây mà nghe câu này chắc nó xin về nước.", "Hôm nay để não ở nhà hả mày?", "Bấm bừa đúng không? Khai thật đi.", "Thôi xong, tao mất niềm tin vào nhân loại.", "Ê, tiếng Anh chứ có phải xổ số đâu mà đoán.", "Gu gồ dịch mà thấy câu này cũng phải xin nghỉ việc.", "Mày đọc đề chưa vậy con?", "Cô giáo cấp hai của mày mà thấy chắc khóc.", "Sai rồi đồ óc bã đậu. Đọc giải thích kìa.", "Trật lất. Tao muốn độn thổ giùm mày."],
    wrongEasy: ["Câu dễ nhất bộ đề mà mày cũng sai?", "Câu mẫu giáo mà cũng trật, tao cạn lời.", "Cái này nhắm mắt cũng đúng. Mày mở mắt mà vẫn sai."],
    wrongStreak: ["Sai liên tiếp luôn. Đang phá kỷ lục cá nhân hả?", "Lại sai! Mày định sai cho đủ bộ à?", "Sai liền mấy câu rồi. Tao bắt đầu thấy thương mày đó.", "Đi uống miếng nước đi, não mày đang quá nhiệt.", "Mày cố tình chọc tao đúng không?"],
    vietlish: ["Chuẩn tiếng Anh bồi luôn, ra chợ bán vé số được rồi.", "Dịch từng chữ từ tiếng Việt sang hả? Tây nó ngất.", "Câu này mà nói với Tây là nó gọi cảnh sát đó.", "Tiếng Anh made in Chợ Lớn đây rồi."],
    timeout: ["Hết giờ! Mày ngủ gật hả?", "Nghĩ lâu vậy mà vẫn không ra, đi pha mì đi.", "Đồng hồ chạy chứ có đứng chờ mày đâu.", "Treo máy luôn rồi hả? Khởi động lại não đi."],
    right: ["Ờ, được đó. Ăn may hả?", "Ghê nha mày!", "Chuẩn. Lần này không ngu.", "Tạm chấp nhận.", "Đúng rồi, đừng có vênh mặt.", "Hay đấy, tao bắt đầu nể rồi.", "Ô kê, có học bài.", "Đúng. Nhưng đừng tưởng tao sẽ khen nhiều."],
    rightStreak: ["Combo! Ủa ai nhập mày vậy?", "Đúng liền mấy câu, mày uống thuốc gì vậy?", "Đỉnh! Tao rút lại mấy câu chửi lúc nãy. Một nửa thôi.", "Đúng liên tục! Tây con đây chứ đâu."],
    comeback: ["Ơ, cuối cùng cũng đúng một câu. Mừng quá!", "Được rồi đó! Tưởng mày hết cứu rồi chứ.", "Đúng rồi kìa! Tao suýt khóc."],
    fifty: ["Yếu thế, phải xin trợ giúp à? Thôi tao bỏ bớt hai câu sai cho.", "Xài phao hả? Còn hai câu, mà sai nữa thì hết nói."],
    lastLife: ["Còn một mạng thôi đó, run chưa?"],
    gameover: ["Hết mạng rồi. Về ôn bài đi rồi quay lại tao chửi tiếp."],
    scare: ["Ê!!! Sai nữa là tao tới nhà mày đó!", "Tao thấy mày rồi nha! Học hành kiểu gì vậy hả?", "Bùuu! Giật mình chưa? Giật mình thì học đi!"],
    rank: ["Thôi mày về học lại bảng chữ cái đi. Nghiêm túc đó.", "Đủ để hỏi đường, không đủ để Tây hiểu mày nói gì.", "Nửa đúng nửa sai, như đi xổ số. Ráng lên.", "Được đó, tao bớt chửi rồi. Còn mấy lỗi ngu ngu bên dưới kìa.", "Ủa mày đi du học về hả? Tao hết chỗ chửi luôn."],
  },
  kind: {
    home: ["Chào bạn! Mình cùng ôn tiếng Anh nhé.", "Sẵn sàng chưa? Chơi vui là chính nha."],
    prompt: ["Câu tiếp theo nè, từ từ thôi.", "Bạn làm tốt lắm, tiếp tục nhé.", "Đọc kỹ đề rồi chọn nha."],
    wrong: ["Chưa đúng rồi, không sao nha.", "Tiếc quá, xem giải thích bên dưới nhé.", "Sai một chút thôi, lần sau sẽ đúng.", "Câu này dễ nhầm lắm, nhớ mẹo bên dưới nhé."],
    wrongEasy: ["Câu này quen lắm, xem lại một chút là nhớ ngay."],
    wrongStreak: ["Đừng nản nhé, nghỉ một chút rồi làm tiếp.", "Mình chậm lại, đọc kỹ đề nha."],
    vietlish: ["Người Việt hay nhầm câu này lắm, nhớ cách nói đúng bên dưới nha."],
    timeout: ["Hết giờ mất rồi, câu sau nhanh hơn chút nhé."],
    right: ["Chính xác!", "Giỏi quá!", "Đúng rồi, tuyệt!", "Chuẩn luôn!"],
    rightStreak: ["Đúng liên tiếp, xuất sắc!", "Phong độ quá!"],
    comeback: ["Đúng rồi! Lấy lại phong độ rồi đó."],
    fifty: ["Mình bỏ bớt hai đáp án sai cho bạn nhé."],
    lastLife: ["Còn một mạng, cẩn thận nha."],
    gameover: ["Hết mạng rồi, ôn lại sổ lỗi rồi thử tiếp nhé."],
    scare: [],
    rank: ["Ai cũng bắt đầu từ đây. Ôn lại các câu sai bên dưới nhé.", "Bạn đã nắm được một phần, cố thêm chút nữa nha.", "Hơn một nửa rồi, tốt lắm!", "Rất tốt! Chỉ còn vài lỗi nhỏ thôi.", "Tuyệt vời, bạn nắm bài rất chắc!"],
  },
};

// [điểm chính xác tối thiểu, emoji, danh hiệu]; lời nhận xét lấy theo LINES[tone].rank cùng vị trí
const RANKS = {
  roast: [[0, "🐌", "Óc ốc sên"], [0.3, "🛵", "Tiếng Anh bồi"], [0.5, "😐", "Tạm, chưa ngu hẳn"], [0.7, "🎓", "Có học hành đàng hoàng"], [0.9, "🤠", "Tây con"]],
  kind: [[0, "🌱", "Mới bắt đầu"], [0.3, "📘", "Đang tiến bộ"], [0.5, "👍", "Khá ổn"], [0.7, "🎓", "Giỏi"], [0.9, "🏆", "Xuất sắc"]],
};

// Meme tự chế: [emoji, chữ trên, chữ dưới, hiệu ứng âm thanh, kiểu chuyển động]
const MEMES = {
  wrong: [
    ["🤡", "TỰ TIN CHỌN ĐÁP ÁN", "XONG SAI", "honk", "spin"],
    ["💀", "TIẾNG ANH CỦA MÀY", "R.I.P", "boom", "zoom"],
    ["🗿", "…", "TAO KHÔNG NÓI GÌ HẾT", "boom", "zoom"],
    ["🧠🔥", "NÃO MÀY LÚC NÀY", "ĐANG BỐC CHÁY", "trombone", "shake"],
    ["🥲", "CÔ GIÁO CẤP 2", "ĐANG KHÓC Ở GÓC PHÒNG", "trombone", "drop"],
    ["🚑", "ALO 115 HẢ", "CỨU TIẾNG ANH NÓ VỚI", "siren", "slide"],
    ["🙈", "TAO KHÔNG DÁM", "NHÌN NỮA", "trombone", "shake"],
    ["📉", "IQ CỦA MÀY", "SAU CÂU NÀY", "fall", "drop"],
    ["🫠", "TAO TAN CHẢY", "VÌ CẠN LỜI", "trombone", "melt"],
    ["🐌", "TỐC ĐỘ HỌC", "CỦA MÀY", "trombone", "slide"],
    ["👴", "ÔNG NỘI TAO 90 TUỔI", "CÒN TRẢ LỜI ĐÚNG", "honk", "zoom"],
    ["🦆", "QUẠC QUẠC", "ĐỒ VỊT", "quack", "spin"],
  ],
  vietlish: [
    ["🛵", "TIẾNG ANH", "MADE IN CHỢ LỚN", "honk", "slide"],
    ["😵", "TÂY NGHE XONG", "NGẤT TẠI CHỖ", "boom", "drop"],
    ["🇻🇳➡️🇺🇸", "DỊCH TỪNG CHỮ", "CHUẨN GOOGLE 2008", "honk", "zoom"],
  ],
  timeout: [
    ["😴", "MÀY ĐANG NGỦ", "HAY ĐANG THI?", "snore", "drop"],
    ["⏰", "HẾT GIỜ", "ĐỒ RÙA", "honk", "shake"],
    ["🐢", "RÙA CÒN NHANH", "HƠN MÀY", "trombone", "slide"],
  ],
  right: [
    ["😎", "ĐÚNG RỒI", "NGẦU CHƯA", "ding", "drop"],
    ["🐐", "GOAT", "(CHẮC ĂN MAY)", "ding", "zoom"],
    ["🧠✨", "NÃO", "ĐÃ MỞ KHÓA", "ding", "zoom"],
  ],
  combo: [
    ["🔥", "COMBO", "AI NHẬP MÀY VẬY", "airhorn", "zoom"],
    ["🤯", "ĐÚNG LIÊN TỤC", "TAO SỢ MÀY RỒI", "airhorn", "spin"],
    ["🚀", "TÂY CON", "CẤT CÁNH", "airhorn", "slide"],
  ],
  scare: [["👹", "SAI NỮA LÀ", "TAO TỚI NHÀ ĐÓ"], ["💀", "TAO THẤY MÀY", "RỒI NHA"], ["👺", "BÙUU!", "HỌC ĐI!"]],
};

// Tiếng cười chọc quê (đã thu sẵn, chỉ phát tiếng, không hiện chữ)
const LAUGHS = ["Há há há há! Quê chưa mày?", "Hê hê hê, sai rồi kìa!", "Ha ha ha, cười đau cả bụng!", "Ố ồ! Hí hí hí, ngu ghê!", "Ha ha, quê xệ luôn!",
  "Khặc khặc khặc, tao cười rớt cả hàm.", "Hô hô hô! Trật lất rồi con ơi!", "Hí hí, mắc cỡ chưa?", "Ha ha ha ha ha! Thôi tao chịu!", "Úi giời ơi, ha ha, quê ghê!"];

// Meme chó mèo: [ảnh trong public/memes/ hoặc emoji, chữ trên, chữ dưới, hiệu ứng, chuyển động, có cười không]
// Ảnh meme sưu tầm trên Google (g*.jpg) và từ ảnh chụp người dùng gửi (m*.jpg) – chỉ dùng cá nhân,
// đừng đăng app này lên mạng kèm các ảnh này. Chữ trên/dưới để "" nếu ảnh đã có chữ sẵn.
const M = n => "memes/" + n + ".jpg";
const PETS = {
  wrong: [
    [M("g04"), "MÀY SAI KÌA", "", "honk", "zoom", true],
    [M("g08"), "ĐÁP ÁN CỦA MÀY", "", "honk", "zoom", true],
    [M("g16"), "", "", "honk", "drop", true],
    [M("g36"), "MÀY SAI RỒI", "", "honk", "zoom", true],
    [M("g54"), "", "", "boom", "zoom", true],
    [M("g56"), "TAO NGHE ĐÁP ÁN CỦA MÀY", "", "honk", "slide", true],
    [M("g57"), "TAO BIẾT NGAY MÀ", "MÀY SẼ SAI", "boom", "zoom", true],
    [M("g59"), "CƯỜI VÀO MẶT MÀY", "", "honk", "zoom", true],
    [M("g55"), "TAO KHI THẤY MÀY", "CHỌN ĐÁP ÁN ĐÓ", "honk", "slide", true],
    [M("g62"), "ĐỨA NÀO SAI ĐÓ", "HÊ HÊ", "honk", "drop", true],
    [M("g48"), "", "", "boom", "zoom"],
    [M("g42"), "", "", "boom", "shake"],
    [M("g39"), "KHI THẤY ĐÁP ÁN", "CỦA MÀY", "boom", "shake"],
    [M("g43"), "SAI LÀ", "", "boom", "slide"],
    [M("g29"), "SAI RỒI", "", "trombone", "drop"],
    [M("m01"), "NHÌN ĐÁP ÁN MÀY CHỌN", "", "boom", "zoom"],
    [M("m02"), "THẦY BẢO SUY NGHĨ KỸ", "MÀY THÌ…", "honk", "slide", true],
    [M("m08"), "TAO BIẾT NGAY MÀ", "MÀY SẼ SAI", "boom", "zoom", true],
    [M("m09"), "TAO NHÌN MÀY", "BẰNG ÁNH MẮT NÀY", "boom", "slide"],
    [M("m06"), "THẤY MÀY SAI", "", "honk", "zoom", true],
    [M("m07"), "HAI ĐỨA TAO", "ĐANG XEM MÀY THI", "trombone", "slide", true],
  ],
  easy: [[M("g07"), "CÂU DỄ VẬY MÀ CŨNG SAI", "", "boom", "shake"], [M("g06"), "CÂU MẪU GIÁO MÀ SAI", "", "boom", "zoom"], [M("g50"), "CÂU DỄ NHẤT ĐỀ", "", "boom", "shake"]],
  vietlish: [[M("g18"), "TÂY NGHE MÀY NÓI", "", "honk", "slide"], [M("g19"), "", "", "boom", "zoom"], [M("g09"), "TIẾNG ANH KIỂU NÀY", "", "honk", "spin"], [M("g11"), "TÂY NGHE XONG", "", "trombone", "drop"]],
  streak: [[M("g01"), "SAI LIÊN TỤC", "", "boom", "shake"], [M("g53"), "SAI NỮA HẢ", "", "boom", "slide"], [M("g37"), "TAO KHÓC VÌ MÀY", "", "trombone", "drop"], [M("g46"), "MÀY SAI HOÀI", "", "trombone", "melt"],
    [M("g41"), "SAI NHIỀU VẬY", "", "boom", "shake"], [M("g03"), "SAI NỮA LÀ", "", "boom", "zoom"], [M("g21"), "", "", "boom", "slide"], [M("m03"), "SAI NỮA LÀ BIẾT TAY", "", "boom", "slide"]],
  timeout: [[M("g51"), "NÃO MÀY ĐANG", "", "snore", "drop"], [M("g28"), "HẾT GIỜ RỒI", "MÀY CÒN NGHĨ GÌ", "snore", "drop"]],
  right: [[M("g33"), "ĐÚNG RỒI", "TAO DUYỆT", "ding", "zoom"], [M("g27"), "ĐÚNG RỒI", "", "ding", "zoom"], [M("g05"), "ĐÚNG RỒI NÈ", "", "ding", "drop"], [M("g40"), "ĐÚNG RỒI", "TAO TỰ HÀO VỀ MÀY", "ding", "zoom"],
    [M("g64"), "ĐƯỢC TAO KHEN LÀ", "MẮC CỠ LUÔN", "ding", "drop"], [M("g22"), "Ủa", "ĐÚNG THẬT HẢ?", "ding", "spin"], [M("m04"), "TRẢ LỜI ĐÚNG HẢ", "THƯỞNG CÁI HÔN NÈ", "ding", "zoom"]],
  combo: [[M("g35"), "ĐÚNG LIÊN TỤC", "", "airhorn", "zoom"], [M("m04"), "ĐÚNG LIÊN TỤC", "THƯỞNG CÁI HÔN NÈ", "airhorn", "spin"], [M("g33"), "COMBO", "TAO PHỤC MÀY RỒI", "airhorn", "zoom"]],
  comeback: [[M("g45"), "CUỐI CÙNG CŨNG ĐÚNG", "", "ding", "slide"]],
};
