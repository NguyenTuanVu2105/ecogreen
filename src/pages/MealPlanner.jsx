import { useState } from "react";
import { IconCart, IconSearch } from "../components/icons.jsx";

function MealPlanner() {
  const [prompt, setPrompt] = useState("");
  const [show, setShow] = useState(false);
  const [cart, setCart] = useState([]);

  // ===============================
  // DỮ LIỆU CỐ ĐỊNH
  // ===============================

  const products = [
    {
      id: 1,
      name: "Đậu phụ",
      price: 12000,
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_5_16_638514746522732885_dau-hu-de-tu-lanh-duoc-bao-lau.jpg",
    },
    {
      id: 2,
      name: "Cà chua",
      price: 10000,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
    },
    {
      id: 3,
      name: "Rau muống",
      price: 8000,
      image:
        "data:image/jpeg;base64,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",
    },
    {
      id: 4,
      name: "Cánh gà",
      price: 35000,
      image:
        "https://vietmartjp.com/wp-content/uploads/2022/02/3.png",
    },
    {
      id: 5,
      name: "Bí đao",
      price: 8000,
      image:
        "https://cdn.tgdd.vn/2022/07/CookDish/cach-chon-bi-dao-ngon-va-cach-bao-quan-bi-dao-tuoi-ngon-lau-avt-1200x676-1.jpg",
    },
    {
      id: 6,
      name: "Tôm khô",
      price: 5000,
      image:
        "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_1_16_638410138712913207_cach-bao-quan-tom-kho-00.jpg",
    },
    {
      id: 7,
      name: "Trứng vịt",
      price: 14000,
      image: "https://vcdn1-suckhoe.vnecdn.net/2022/11/16/top-view-duck-eggs-dark-surfac-6876-6376-1668579155.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=mXssllLnIZUVN1ZbBbQfig",
    },
    {
      id: 8,
      name: "Thịt lợn xay",
      price: 20000,
      image:
        "https://fujimart.vn/wp-content/uploads/2024/01/Thit-heo-xay.png",
    },
    {
      id: 9,
      name: "Bắp cải",
      price: 10000,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Cabbage_and_cross_section_on_white.jpg",
    },
  ];

  const menus = [
    {
      id: "m1",
      title: "🌿 Gợi ý 1: Đậu phụ sốt cà chua và Rau muống xào",
      desc: [
        'Đây là thực đơn "quốc dân", dễ ăn, dễ nấu và rất tiết kiệm.',
        "Món mặn: Đậu phụ sốt cà chua",
        "Món rau: Rau muống xào tỏi",
        "Món canh: Nước luộc rau muống dầm sấu hoặc vắt chanh.",
      ],
      shopping: [
        "Đậu phụ: 3-4 bìa (10.000 - 12.000đ)",
        "Cà chua: 3-4 quả (10.000đ)",
        "Rau muống: 1 mớ to (8.000 - 10.000đ)",
        "Hành lá, tỏi, ớt: (5.000đ)",
        "Tổng cộng: Khoảng 33.000 - 37.000đ",
      ],
      productIds: [1, 2, 3],
    },
    {
      id: "m2",
      title: "🍗 Gợi ý 2: Cánh gà chiên mắm và Canh bí đao",
      desc: [
        "Thực đơn này có món mặn hấp dẫn, đảm bảo ai cũng thích.",
        "Món mặn: Cánh gà (hoặc đùi tỏi) chiên nước mắm",
        "Món canh: Canh bí đao nấu tôm (dùng tôm khô hoặc tôm tươi nhỏ)",
      ],
      shopping: [
        "Cánh gà/Đùi tỏi gà: 400g (30.000 - 35.000đ)",
        "Bí đao: 1 khúc nhỏ (8.000đ)",
        "Tôm khô: 1 nhúm nhỏ (5.000đ)",
        "Hành lá, ngò, tỏi: (5.000đ)",
        "Tổng cộng: Khoảng 48.000 - 53.000đ",
      ],
      productIds: [4, 5, 6],
    },
    {
      id: "m3",
      title: "🍳 Gợi ý 3: Trứng đúc thịt và Canh bắp cải",
      desc: [
        "Món này cực kỳ nhanh gọn, đủ chất và no bụng.",
        "Món mặn: Trứng đúc thịt băm",
        "Món canh: Canh bắp cải cuộn thịt hoặc canh bắp cải nấu cà chua.",
      ],
      shopping: [
        "Trứng vịt: 4 quả (12.000 - 14.000đ)",
        "Thịt lợn xay: 150g (20.000đ)",
        "Bắp cải: 1/2 cây nhỏ (10.000đ)",
        "Hành lá, mộc nhĩ, hành tím: (7.000đ)",
        "Tổng cộng: Khoảng 49.000 - 51.000đ",
      ],
      productIds: [7, 8, 9],
    },
  ];

  // ===============================
  // XỬ LÝ
  // ===============================

  const addToCart = (p) => {
    setCart((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev;
      return [...prev, p];
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.toLowerCase().includes("50k")) setShow(true);
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Ô NHẬP */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">Hôm nay ăn gì</h1>
        <p className="text-slate-600 text-sm">
          Nhập nhu cầu của bạn để Ecogreen gợi ý bữa ăn phù hợp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ví dụ: chuẩn bị bữa tối 50k cho gia đình 4 người..."
            className="w-full rounded-3xl border border-slate-200 p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
          >
            <IconSearch className="h-4 w-4" />
            Gợi ý ngay
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setPrompt("Chuẩn bị bữa tối 50k cho gia đình 4 người");
              setShow(true);
            }}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-green-500 hover:text-green-600"
          >
            Chuẩn bị bữa tối 50k cho gia đình 4 người
          </button>
        </div>
      </section>

      {/* GỢI Ý */}
      {show && (
        <section className="mt-10 space-y-10">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {menu.title}
              </h2>
              <div className="space-y-1 text-sm text-slate-700 leading-relaxed">
                {menu.desc.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              <p className="mt-3 font-semibold text-sm text-emerald-700">
                🛒 Danh sách mua sắm (Dự trù):
              </p>
              <ul className="list-disc ml-5 text-sm text-slate-700">
                {menu.shopping.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              {/* SẢN PHẨM LIÊN QUAN */}
              <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {menu.productIds.map((id) => {
                  const p = products.find((x) => x.id === id);
                  if (!p) return null;
                  const inCart = cart.find((c) => c.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold text-slate-800">
                        {p.name}
                      </h3>
                      <p className="text-green-600 font-medium mt-1">
                        {p.price.toLocaleString("vi-VN")}đ
                      </p>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={inCart}
                        className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          inCart
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        <IconCart className="h-4 w-4" />
                        {inCart ? "Đã thêm" : "Thêm vào giỏ"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* GIỎ HÀNG */}
          {cart.length > 0 && (
            <div className="rounded-[32px] border border-green-200 bg-green-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🛍 Giỏ hàng của bạn
              </h3>
              <ul className="list-disc ml-5 text-slate-700 text-sm">
                {cart.map((item) => (
                  <li key={item.id}>
                    {item.name} — {item.price.toLocaleString("vi-VN")}đ
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-semibold text-green-700">
                Tổng cộng:{" "}
                {cart
                  .reduce((s, x) => s + x.price, 0)
                  .toLocaleString("vi-VN")}
                đ
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default MealPlanner;
