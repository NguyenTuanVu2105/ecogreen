import { useState } from "react";
import { IconCart, IconSearch } from "../components/icons.jsx";

// ⚠️ Lưu ý:
// - Nếu bạn dùng Vite: tạo file .env.local với biến VITE_GEMINI_API_KEY
// - Nếu bạn dùng CRA: đổi dòng dưới thành process.env.REACT_APP_GEMINI_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function MealPlanner() {
  const [prompt, setPrompt] = useState("");
  const [show, setShow] = useState(false);
  const [cart, setCart] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // DỮ LIỆU SẢN PHẨM (CỐ ĐỊNH - DÙNG ĐỂ ADD VÀO GIỎ)
  // ======================================================
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
      image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
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
      image: "https://vietmartjp.com/wp-content/uploads/2022/02/3.png",
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
      image:
        "https://vcdn1-suckhoe.vnecdn.net/2022/11/16/top-view-duck-eggs-dark-surfac-6876-6376-1668579155.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=mXssllLnIZUVN1ZbBbQfig",
    },
    {
      id: 8,
      name: "Thịt lợn xay",
      price: 20000,
      image: "https://fujimart.vn/wp-content/uploads/2024/01/Thit-heo-xay.png",
    },
    {
      id: 9,
      name: "Bắp cải",
      price: 10000,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Cabbage_and_cross_section_on_white.jpg",
    },
    {
      id: 10,
      name: "Cải ngọt",
      price: 12000,
      image: "public/assets/img_product/cai_ngot.jpg",
    },
    {
      id: 11,
      name: "Cải bó xôi (Spinach)",
      price: 15000,
      image: "public/assets/img_product/cai_bo_xoi.jpg"
    },
    {
      id: 12,
      name: "Cà rốt",
      price: 9000,
      image: "public/assets/img_product/carot.jpg"
    },
    {
      id: 13,
      name: "Khoai tây",
      price: 10000,
      image: "public/assets/img_product/khoaitay.jpg"
    },
    {
      id: 14,
      name: "Hành tây",
      price: 12000,
      image: "public/assets/img_product/hanhtay.jpg"
    },
    {
      id: 15,
      name: "Ớt chuông đỏ",
      price: 15000,
      image: "public/assets/img_product/otchuongdo.jpg"
    },
    {
      id: 16,
      name: "Su hào",
      price: 8000,
      image: "public/assets/img_product/suhao.jpg"
    },
    {
      id: 17,
      name: "Bí đỏ",
      price: 12000,
      image: "public/assets/img_product/bido.jpg"
    },
    {
      id: 18,
      name: "Dưa leo",
      price: 8000,
      image: "public/assets/img_product/dualeo.jpg"
    },
    {
      id: 19,
      name: "Cải thìa",
      price: 14000,
      image: "public/assets/img_product/caithia.jpg"
    },
    {
      id: 20,
      name: "Ức gà",
      price: 30000,
      image: "public/assets/img_product/ucga.jpg"
    },
    {
      id: 21,
      name: "Đùi gà",
      price: 32000,
      image: "public/assets/img_product/duiga.jpg"
    },
    {
      id: 22,
      name: "Thịt bò xay",
      price: 45000,
      image: "public/assets/img_product/thitboxay.jpg"
    },
    {
      id: 23,
      name: "Cá hồi",
      price: 65000,
      image: "public/assets/img_product/cahoi.jpg"
    },
    {
      id: 24,
      name: "Cá basa phi lê",
      price: 35000,
      image: "public/assets/img_product/cabasa.jpg"
    },
    {
      id: 25,
      name: "Tôm tươi",
      price: 50000,
      image: "public/assets/img_product/tomtuoi.jpg"
    },
    {
      id: 26,
      name: "Thịt ba chỉ",
      price: 40000,
      image: "public/assets/img_product/thitbachi.jpg"
    },
    {
      id: 27,
      name: "Thịt bò lát",
      price: 55000,
      image: "public/assets/img_product/thitbolat.jpg"
    },
    {
      id: 28,
      name: "Cá thu",
      price: 42000,
      image: "public/assets/img_product/cathu.jpg"
    },
    {
      id: 29,
      name: "Mực ống",
      price: 60000,
      image: "public/assets/img_product/mucong.jpg"
    }, {
      id: 30,
      name: "Mì spaghetti",
      price: 20000,
      image: "public/assets/img_product/paketi.jpg"
    },
    {
      id: 31,
      name: "Gạo thơm",
      price: 18000,
      image: "public/assets/img_product/gaothom.jpg"
    },
    {
      id: 32,
      name: "Đậu xanh",
      price: 12000,
      image: "public/assets/img_product/dauxanh.jpg"
    },
    {
      id: 33,
      name: "Hạt nêm",
      price: 15000,
      image: "public/assets/img_product/hatnem.jpg"
    },
    {
      id: 34,
      name: "Nước mắm",
      price: 20000,
      image: "public/assets/img_product/nuocmam.jpg"
    },
    {
      id: 35,
      name: "Dầu ăn",
      price: 25000,
      image: "public/assets/img_product/dâun.jpg"
    },
    {
      id: 36,
      name: "Sữa tươi",
      price: 15000,
      image: "public/assets/img_product/suatuoi.jpg"
    },
    {
      id: 37,
      name: "Bơ lạt",
      price: 30000,
      image: "public/assets/img_product/bolat.jpg"
    },
    {
      id: 38,
      name: "Phô mai lát",
      price: 25000,
      image: "public/assets/img_product/phomailat.png"
    },
    {
      id: 39,
      name: "Sốt cà chua",
      price: 18000,
      image: "public/assets/img_product/sotcachua.jpg"
    },
  ];

  // ======================================================
  // HÀM BUILD PROMPT GỬI LÊN GEMINI
  // ======================================================
  const buildPrompt = (userPrompt) => {
    const catalog = products
      .map(
        (p) =>
          `${p.id} - ${p.name} - price: ${p.price} (VND)`
      )
      .join("\n");

    return `
Bạn là một trợ lý lập kế hoạch bữa ăn tiếng Việt cho ứng dụng Ecogreen.

Nhiệm vụ:
- Dựa trên yêu cầu của người dùng, hãy gợi ý từ 2–4 "combo bữa ăn".
- Mỗi combo gồm:
  • Tiêu đề (title) gọn rõ, có thể thêm emoji.
  • Một vài câu mô tả (description).
  • Các bước nấu món (recipeSteps) – dạng từng bước, đơn giản.
  • Danh sách mua sắm (shoppingList) – liệt kê các nguyên liệu và gợi ý giá.
  • productIds: danh sách id sản phẩm bên dưới tương ứng với combo.

Danh sách sản phẩm có thể dùng (catalog):
${catalog}

Yêu cầu quan trọng:
- Chỉ sử dụng các id có trong catalog.
- Nếu combo không dùng hết các sản phẩm thì chỉ chọn những id phù hợp (không cần dùng hết).
- Nội dung trả về phải là JSON HỢP LỆ, không thêm giải thích bên ngoài.

ĐỊNH DẠNG JSON TRẢ VỀ:

{
  "summary": "Chuỗi mô tả ngắn về gợi ý tổng thể (tiếng Việt)",
  "menus": [
    {
      "id": "m1",
      "title": "Chuỗi",
      "description": ["...", "..."],
      "recipeSteps": ["...", "..."],
      "shoppingList": ["...", "..."],
      "productIds": [1, 2, 3, 4, 5, 6]
    }
  ]
}

Yêu cầu của người dùng: "${userPrompt}".

Hãy trả về JSON đúng cấu trúc trên. Chỉ JSON, không thêm chữ nào khác.
`;
  };

  // ======================================================
  // GỌI GEMINI API
  // ======================================================
  const callGemini = async (userPrompt) => {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Chưa cấu hình GEMINI_API_KEY. Hãy thêm vào file .env (VITE_GEMINI_API_KEY hoặc REACT_APP_GEMINI_API_KEY)."
      );
    }

    const fullPrompt = buildPrompt(userPrompt);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          // Gợi ý Gemini trả thẳng JSON
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Lỗi gọi Gemini: ${res.status} - ${text}`);
    }

    const data = await res.json();

    // Gemini sẽ trả JSON ở content.parts[0].text (đã là chuỗi JSON)
    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.json;

    if (!raw) {
      throw new Error("Không đọc được dữ liệu trả về từ Gemini.");
    }

    // Nếu Gemini đã trả object JSON thì dùng luôn, nếu trả string thì parse
    let parsed;
    if (typeof raw === "string") {
      parsed = JSON.parse(raw);
    } else {
      parsed = raw;
    }

    return parsed;
  };

  // ======================================================
  // LOGIC GIỎ HÀNG
  // ======================================================
  const addToCart = (p) => {
    setCart((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev;
      return [...prev, p];
    });
  };

  // ======================================================
  // XỬ LÝ SUBMIT
  // ======================================================
  const handleGenerate = async (userPrompt) => {
    if (!userPrompt.trim()) return;
    setError("");
    setLoading(true);
    setShow(false);
    setAiPlan(null);
    setCart([]);

    try {
      const plan = await callGemini(userPrompt);
      setAiPlan(plan);
      setShow(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi gọi Gemini.");
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleGenerate(prompt);
  };

  const handleQuickPrompt = async (text) => {
    setPrompt(text);
    await handleGenerate(text);
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Ô NHẬP */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <h1 className="text-3xl font-semibold text-slate-900">
          Hôm nay ăn gì?
        </h1>
        <p className="text-slate-600 text-sm">
          Nhập nhu cầu của bạn, Ecogreen (dùng Gemini) sẽ gợi ý bữa ăn phù hợp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ví dụ: chuẩn bị bữa tối 50k cho gia đình 4 người, ưu tiên healthy..."
            className="w-full rounded-3xl border border-slate-200 p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-pulse">Đang suy nghĩ...</span>
            ) : (
              <>
                <IconSearch className="h-4 w-4" />
                Gợi ý ngay
              </>
            )}
          </button>
        </form>

        {/* GỢI Ý NHANH */}
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() =>
              handleQuickPrompt("Chuẩn bị bữa tối 50k cho gia đình 4 người")
            }
            className="rounded-full border border-slate-200 px-4 py-2 hover:border-green-500 hover:text-green-600"
          >
            Bữa tối 50k cho 4 người
          </button>
          <button
            onClick={() =>
              handleQuickPrompt("combo giá rẻ cho học sinh sinh viên dưới 35k")
            }
            className="rounded-full border border-slate-200 px-4 py-2 hover:border-green-500 hover:text-green-600"
          >
            Combo giá rẻ sinh viên
          </button>
          <button
            onClick={() =>
              handleQuickPrompt(
                "combo healthy eat clean cho 2 người, ít dầu mỡ, nhiều rau"
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 hover:border-green-500 hover:text-green-600"
          >
            Combo healthy
          </button>
          <button
            onClick={() =>
              handleQuickPrompt(
                "bữa ăn đủ chất nhưng nấu siêu nhanh trong 15 phút"
              )
            }
            className="rounded-full border border-slate-200 px-4 py-2 hover:border-green-500 hover:text-green-600"
          >
            Combo siêu nhanh 15 phút
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ {error}
          </p>
        )}
      </section>

      {/* GỢI Ý TỪ AI */}
      {show && aiPlan && aiPlan.menus && (
        <section className="mt-10 space-y-10">
          {aiPlan.summary && (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              <strong>Tổng quan: </strong>
              {aiPlan.summary}
            </div>
          )}

          {aiPlan.menus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {menu.title}
              </h2>

              {/* Mô tả */}
              {menu.description && (
                <div className="space-y-1 text-sm text-slate-700 leading-relaxed">
                  {menu.description.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}

              {/* Công thức nấu */}
              {menu.recipeSteps && menu.recipeSteps.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm text-emerald-700">
                    👩‍🍳 Công thức nấu ăn:
                  </p>
                  <ul className="list-disc ml-5 text-sm text-slate-700">
                    {menu.recipeSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Danh sách mua sắm */}
              {menu.shoppingList && menu.shoppingList.length > 0 && (
                <>
                  <p className="mt-3 font-semibold text-sm text-emerald-700">
                    🛒 Danh sách mua sắm (Dự trù):
                  </p>
                  <ul className="list-disc ml-5 text-sm text-slate-700">
                    {menu.shoppingList.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* SẢN PHẨM LIÊN QUAN LẤY THEO productIds */}
              {menu.productIds && menu.productIds.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {menu.productIds.map((id, idx) => {
                    const p = products.find((x) => x.id === id);
                    if (!p) return null;
                    const inCart = cart.find((c) => c.id === p.id);

                    return (
                      <div
                        key={`${p.id}-${idx}`}
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
                          className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${inCart
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
              )}
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
