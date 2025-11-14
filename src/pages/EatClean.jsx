import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { IconCart, IconCamera, IconMap } from "../components/icons.jsx";

// Thử lấy API key từ nhiều biến môi trường khác nhau cho linh hoạt
const GEMINI_API_KEY =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GEMINI_KEY ||
    "";

const CART_STORAGE_KEY = "smartbuy_cart";
const BMI_HISTORY_KEY = "eatclean_bmi_history";
const VISION_HISTORY_KEY = "eatclean_vision_history";

function EatClean() {
    // ==== STATE CƠ BẢN ====
    const [userLocation, setUserLocation] = useState(null);
    const [nearestMarket, setNearestMarket] = useState(null);

    const [dragActive, setDragActive] = useState(false);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [visionData, setVisionData] = useState(null); // JSON từ Gemini Vision
    const [visionError, setVisionError] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [cart, setCart] = useState([]);
    const [showQr, setShowQr] = useState(false);

    const [bmiForm, setBmiForm] = useState({
        height: "",
        weight: "",
        waist: "",
        bellyFat: "medium",
        activity: "moderate",
        goal: "lose_weight",
    });
    const [bmiAnalysis, setBmiAnalysis] = useState(null);
    const [bmiLoading, setBmiLoading] = useState(false);
    const [bmiHistory, setBmiHistory] = useState([]);

    const [mealPlan, setMealPlan] = useState(null); // JSON kế hoạch 7 ngày
    const [shoppingList, setShoppingList] = useState(null);
    const [mealLoading, setMealLoading] = useState(false);

    const [visionHistory, setVisionHistory] = useState([]);

    // ====== SIÊU THỊ FIX CỨNG (GPS SẼ CHỌN GẦN NHẤT) ======
    const supermarkets = [
        {
            id: "lan-chi",
            name: "LanChi Mart Hòa Lạc",
            address: "Km29 Đại lộ Thăng Long, Hòa Lạc",
            lat: 21.012493,
            lng: 105.52791,
            open: "07:00 - 22:00",
        },
        {
            id: "winmart-fpt",
            name: "WinMart – ĐH FPT",
            address: "Khuôn viên ĐH FPT, Khu CNC Hòa Lạc",
            lat: 21.013421,
            lng: 105.525329,
            open: "07:00 - 22:00",
        },
        {
            id: "fujimart",
            name: "FujiMart Xuân Mai",
            address: "QL21, Xuân Mai, Chương Mỹ",
            lat: 20.897781,
            lng: 105.633112,
            open: "08:00 - 21:30",
        },
        {
            id: "manhquan",
            name: "Siêu Thị Mạnh Quân",
            address: "Thạch Hòa, Thạch Thất, Hanoi, Vietnam",
            lat: 21.010409199576824,
            lng: 105.5175211522726,
            open: "08:00 - 21:30",
        },
        {
            id: "bigtrend",
            name: "BigTrend Hòa Lạc",
            address: "Tòa Hòa Lạc Plaza, số 232 thôn 3, Thạch Hoà, Thạch Thất, Hà Nội 13113, Vietnam",
            lat: 21.00960263557717,
            lng: 105.5179309351856,
            open: "24/7"
        },
        {
            id: "5xu",
            name: "5 Xu Mart",
            address: "454 thôn 3, Thạch Hoà, Thạch Thất, Hà Nội, Vietnam",
            lat: 21.00960263557717,
            lng: 105.51830971929785,
            open: "24/7"
        },
        {
            id: "ohiomart",
            name: "Ohio Mart",
            address: "QL21A, Thạch Hoà, Thạch Thất, Hà Nội, Vietnam",
            lat: 21.01001314462787,
            lng: 105.51812912291706,
            open: "24/7"
        },
    ];

    // ====== "THỰC PHẨM" ĂN KIÊNG EATCLEAN (KHÔNG PHẢI MÓN SẴN) ======
    const ingredientCatalog = useMemo(
        () => [
            {
                id: 1,
                name: "Ức gà",
                group: "weight_loss",
                calories: 165,
                protein: 31,
                fat: 3.6,
                carb: 0,
                price: 45000,
                unit: "300g",
                image:
                    "public/assets/img_product/ucga.jpg",
            },
            {
                id: 2,
                name: "Cá hồi phi lê",
                group: "balanced",
                calories: 208,
                protein: 20,
                fat: 13,
                carb: 0,
                price: 85000,
                unit: "250g",
                image:
                    "public/assets/img_product/cahoi.jpg",
            },
            {
                id: 3,
                name: "Trứng gà ta",
                group: "balanced",
                calories: 70,
                protein: 6,
                fat: 5,
                carb: 0.6,
                price: 28000,
                unit: "10 quả",
                image:
                    "public/assets/img_product/trungga.jpg",
            },
            {
                id: 4,
                name: "Bông cải xanh",
                group: "weight_loss",
                calories: 34,
                protein: 3,
                fat: 0.4,
                carb: 6.6,
                price: 16000,
                unit: "1 cây",
                image:
                    "public/assets/img_product/bongcaixanh.jpg",
            },
            {
                id: 5,
                name: "Yến mạch nguyên hạt",
                group: "weight_gain",
                calories: 380,
                protein: 13,
                fat: 7,
                carb: 68,
                price: 55000,
                unit: "500g",
                image:
                    "public/assets/img_product/yenmach.jpg",
            },
            {
                id: 6,
                name: "Khoai lang",
                group: "balanced",
                calories: 86,
                protein: 1.6,
                fat: 0.1,
                carb: 20,
                price: 20000,
                unit: "1kg",
                image:
                    "public/assets/img_product/khoailang.jpg"
            },
            {
                id: 7,
                name: "Hạt chia",
                group: "weight_loss",
                calories: 486,
                protein: 17,
                fat: 31,
                carb: 42,
                price: 65000,
                unit: "300g",
                image:
                    "public/assets/img_product/hatchia.jpg",
            },
            {
                id: 8,
                name: "Sữa chua không đường",
                group: "balanced",
                calories: 60,
                protein: 5,
                fat: 3,
                carb: 4,
                price: 30000,
                unit: "4 hộp",
                image:
                    "public/assets/img_product/suachuakhongduong.jpg",
            },
        ],
        []
    );

    // ===== ĐỌC CART & LỊCH SỬ TỪ LOCALSTORAGE =====
    useEffect(() => {
        try {
            const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
            if (rawCart) {
                setCart(JSON.parse(rawCart));
            }
        } catch {
            // ignore
        }

        try {
            const rawBmi = window.localStorage.getItem(BMI_HISTORY_KEY);
            if (rawBmi) {
                setBmiHistory(JSON.parse(rawBmi));
            }
        } catch {
            // ignore
        }

        try {
            const rawVision = window.localStorage.getItem(VISION_HISTORY_KEY);
            if (rawVision) {
                setVisionHistory(JSON.parse(rawVision));
            }
        } catch {
            // ignore
        }
    }, []);

    const persistBmiHistory = (nextHistory) => {
        setBmiHistory(nextHistory);
        try {
            window.localStorage.setItem(
                BMI_HISTORY_KEY,
                JSON.stringify(nextHistory.slice(0, 20))
            );
        } catch {
            // ignore
        }
    };

    const persistVisionHistory = (nextHistory) => {
        setVisionHistory(nextHistory);
        try {
            window.localStorage.setItem(
                VISION_HISTORY_KEY,
                JSON.stringify(nextHistory.slice(0, 20))
            );
        } catch {
            // ignore
        }
    };

    // ==== 1. LẤY GPS NGƯỜI DÙNG ====
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                setUserLocation(null);
            }
        );
    }, []);

    // ==== 2. TÍNH SIÊU THỊ GẦN NHẤT ====
    useEffect(() => {
        if (!userLocation) {
            setNearestMarket({ market: supermarkets[0], dist: null });
            return;
        }

        const distanceKm = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        let best = { market: null, dist: Infinity };
        supermarkets.forEach((m) => {
            const d = distanceKm(
                userLocation.lat,
                userLocation.lng,
                m.lat,
                m.lng
            );
            if (d < best.dist) best = { market: m, dist: d };
        });
        setNearestMarket(best);
    }, [userLocation, supermarkets]);

    // ==== ADD TO CART (LOCALSTORAGE) ====
    const addToCart = (product) => {
        setShowQr(false);
        setCart((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            const next = exists
                ? prev
                : [...prev, { ...product, quantity: 1 }];
            try {
                window.localStorage.setItem(
                    CART_STORAGE_KEY,
                    JSON.stringify(next)
                );
            } catch {
                // ignore
            }
            return next;
        });
    };

    const totalPrice = cart.reduce(
        (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
        0
    );

    const qrPayload = useMemo(() => {
        const marketName = nearestMarket?.market?.name ?? "SmartBuy Hòa Lạc";
        return JSON.stringify({
            market: marketName,
            total: totalPrice,
            items: cart.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity ?? 1,
            })),
        });
    }, [cart, nearestMarket, totalPrice]);

    // ==== 3. DRAG&DROP + FILE UPLOAD → GEMINI VISION ====
    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setUploadPreview(base64);
            callGeminiVision(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleUploadChange = (e) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    // ==== 4. GỌI GEMINI VISION: PHÂN TÍCH ẢNH MÓN ĂN → JSON ====
    const callGeminiVision = async (base64) => {
        if (!GEMINI_API_KEY) {
            setVisionError("Chưa cấu hình GEMINI_API_KEY.");
            return;
        }

        setAiLoading(true);
        setVisionError(null);
        setVisionData(null);

        // Tự phát hiện MIME
        const mime = base64.substring(
            base64.indexOf(":") + 1,
            base64.indexOf(";")
        );
        const pureBase64 = base64.split(",")[1];

        const prompt = `
Phân tích món ăn trong ảnh. 
HÃY TRẢ VỀ DUY NHẤT JSON hợp lệ, không có văn bản thừa, không giải thích.

Nếu không phân tích được, trả về:
{
  "error": "cannot_analyze"
}

Nếu phân tích được, trả về JSON với cấu trúc:
{
  "calories": number,
  "carb": number,
  "fat": number,
  "protein": number,
  "oil_level": "thấp" | "vừa" | "cao",
  "is_eatclean": boolean,
  "warnings": string[],
  "short_summary": string,
  "suggest_replacements": string[]
}
`;

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
                                    {
                                        inline_data: {
                                            mime_type: mime,
                                            data: pureBase64,
                                        },
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            response_mime_type: "application/json",
                        }
                    }),
                }
            );

            const json = await res.json();

            let raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            // console.log("🔥 RAW FROM GEMINI:", raw);

            // Google đôi khi trả JSON kèm dấu ` ```json … ```
            raw = raw.replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                setVisionError("AI không trả về JSON hợp lệ.");
                return;
            }

            setVisionData(parsed);

        } catch (err) {
            console.error(err);
            setVisionError("Lỗi AI hoặc kết nối. Vui lòng thử lại.");
        } finally {
            setAiLoading(false);
        }
    };



    // ==== 5. BMI ANALYZER AI (DỮ LIỆU → JSON) ====
    const handleBmiChange = (field, value) => {
        setBmiForm((prev) => ({ ...prev, [field]: value }));
    };

    const computeBmiSimple = () => {
        const h = parseFloat(bmiForm.height) / 100;
        const w = parseFloat(bmiForm.weight);
        if (!h || !w) return null;
        return w / (h * h);
    };

    const callBmiAI = async () => {
        if (!GEMINI_API_KEY) {
            setBmiAnalysis({
                error: "Chưa cấu hình API_KEY.",
            });
            return;
        }

        const simpleBmi = computeBmiSimple();
        if (!simpleBmi) {
            setBmiAnalysis({ error: "Vui lòng nhập chiều cao & cân nặng hợp lệ." });
            return;
        }

        setBmiLoading(true);

        const fullPrompt = `
      Bạn là chuyên gia dinh dưỡng & sức khỏe. Dựa trên thông tin sau:

      - Chiều cao: ${bmiForm.height} cm
      - Cân nặng: ${bmiForm.weight} kg
      - Vòng bụng (waist): ${bmiForm.waist || "không cung cấp"} cm
      - Mức mỡ bụng dưới (user tự đánh giá): ${bmiForm.bellyFat}
      - Mức độ vận động: ${bmiForm.activity}
      - Mục tiêu sức khỏe: ${bmiForm.goal}
      - BMI tính sơ bộ: ${simpleBmi.toFixed(1)}

      Hãy ước tính:
      - body_fat % (mỡ cơ thể)
      - visceral_fat_level: "thấp" | "trung bình" | "cao"
      - calories_burn: năng lượng ước tính tiêu hao mỗi ngày (kcal)
      - risk_level: "thấp" | "vừa" | "cao"
      - health_risks: danh sách các nguy cơ sức khỏe chính
      - nutrition_advice: gồm 3 mảng: eat_more, avoid, habits (mỗi mảng là string[])
      - summary: đoạn mô tả ngắn (~3-4 câu) bằng tiếng Việt

      Trả về JSON với cấu trúc:

      {
        "bmi": number,
        "body_fat": number,
        "visceral_fat_level": "thấp" | "trung bình" | "cao",
        "calories_burn": number,
        "risk_level": "thấp" | "vừa" | "cao",
        "health_risks": string[],
        "nutrition_advice": {
          "eat_more": string[],
          "avoid": string[],
          "habits": string[]
        },
        "summary": string
      }

      Không thêm giải thích bên ngoài JSON.
    `;

        try {
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
                        generationConfig: {
                            response_mime_type: "application/json",
                        },
                    }),
                }
            );

            const json = await res.json();
            const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = null;
            }

            if (!parsed || typeof parsed !== "object") {
                setBmiAnalysis({
                    error: "AI không phân tích được chỉ số BMI.",
                    bmi: simpleBmi,
                });
            } else {
                // đảm bảo luôn có bmi
                if (!parsed.bmi) {
                    parsed.bmi = simpleBmi;
                }
                setBmiAnalysis(parsed);

                // lưu lịch sử BMI
                const entry = {
                    id: Date.now(),
                    createdAt: new Date().toISOString(),
                    bmi: parsed.bmi,
                    body_fat: parsed.body_fat,
                    goal: bmiForm.goal,
                };

                const next = [entry, ...bmiHistory];
                persistBmiHistory(next);
            }
        } catch (err) {
            console.error("BMI AI error:", err);
            setBmiAnalysis({
                error: "Lỗi khi gọi AI phân tích BMI.",
                bmi: simpleBmi,
            });
        } finally {
            setBmiLoading(false);
        }
    };

    // ==== 6. MEAL PLAN 7 NGÀY + SHOPPING LIST (AI JSON CHI TIẾT) ====
    const callMealPlanAI = async () => {
        if (!GEMINI_API_KEY) {
            setMealPlan(null);
            setShoppingList(null);
            return;
        }

        const baseBmi = bmiAnalysis?.bmi ?? computeBmiSimple();
        if (!baseBmi) {
            // yêu cầu user tính BMI trước để cá nhân hóa meal plan
            setMealPlan({
                error: "Hãy tính BMI trước khi tạo Meal Plan EatClean.",
            });
            return;
        }

        setMealLoading(true);

        const fullPrompt = `
      Bạn là chuyên gia dinh dưỡng. Hãy tạo thực đơn EatClean 7 ngày cho người dùng với thông tin:

      - BMI: ${baseBmi.toFixed(1)}
      - Mục tiêu: ${bmiForm.goal}
      - Mức vận động: ${bmiForm.activity}

      Yêu cầu:
      - Mỗi ngày có 3 bữa: breakfast, lunch, dinner.
      - Mỗi bữa ghi rõ tên món (tiếng Việt) + calories + protein + carb + fat.
      - Tập trung nguyên liệu dễ mua ở siêu thị Việt Nam (gà, cá, trứng, rau xanh, khoai lang, yến mạch...).
      - Tổng năng lượng cả ngày ~ 1500–1900 kcal (tùy BMI & mục tiêu).

      Trả về JSON với cấu trúc:

      {
        "days": {
          "day1": {
            "breakfast": { "name": string, "calories": number, "protein": number, "carb": number, "fat": number },
            "lunch":     { ... },
            "dinner":    { ... }
          },
          "day2": { ... },
          ...
          "day7": { ... }
        },
        "shopping_list": {
          // key là tên nguyên liệu (tiếng Việt), value là số lượng + đơn vị, ví dụ:
          // "Ức gà": "1.2kg",
          // "Bông cải xanh": "7 cây"
        }
      }

      Không thêm giải thích ngoài JSON.
    `;

        try {
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
                        generationConfig: {
                            response_mime_type: "application/json",
                        },
                    }),
                }
            );

            const json = await res.json();
            const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                parsed = null;
            }

            if (!parsed || typeof parsed !== "object" || !parsed.days) {
                setMealPlan({ error: "AI không tạo được kế hoạch 7 ngày." });
                setShoppingList(null);
            } else {
                setMealPlan(parsed);
                setShoppingList(parsed.shopping_list || null);
            }
        } catch (err) {
            console.error("Meal plan AI error:", err);
            setMealPlan({ error: "Lỗi khi gọi AI tạo meal plan." });
            setShoppingList(null);
        } finally {
            setMealLoading(false);
        }
    };

    // ==== 7. GỢI Ý THỰC PHẨM EATCLEAN DỰA TRÊN BMI + ẢNH AI ====
    const ingredientSuggestions = useMemo(() => {
        if (!ingredientCatalog.length) return [];

        const bmi = bmiAnalysis?.bmi ?? computeBmiSimple();
        const oilHigh =
            visionData?.oil_level === "cao" || (visionData?.fat ?? 0) > 25;

        let targetGroup = "balanced";

        if (bmi && bmi >= 30) {
            targetGroup = "weight_loss";
        } else if (bmi && bmi < 18.5) {
            targetGroup = "weight_gain";
        } else if (bmi && bmi >= 25 && oilHigh) {
            targetGroup = "weight_loss";
        }

        return ingredientCatalog.filter(
            (item) =>
                item.group === targetGroup || item.group === "balanced"
        );
    }, [ingredientCatalog, bmiAnalysis, visionData]);

    // ====== JSX ======
    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
            {/* OVERLAY LOADING GEMINI */}
            {(aiLoading || bmiLoading || mealLoading) && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="rounded-3xl bg-slate-900/80 px-8 py-6 text-center text-slate-100 shadow-xl border border-emerald-400/30">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/70 border-t-transparent" />
                        <p className="text-sm font-medium">
                            AI đang xử lý dữ liệu sức khỏe của bạn...
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Phân tích ảnh món ăn · Phân tích BMI · Tạo thực đơn EatClean
                        </p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="rounded-[32px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 px-8 py-6 text-white shadow-lg">
                <h1 className="text-3xl font-semibold">EatClean Dashboard</h1>
                <p className="mt-1 text-sm text-emerald-50">
                    Trợ lý EatClean all-in-one: phân tích ảnh, phân tích BMI, gợi ý thực
                    phẩm, tạo thực đơn 7 ngày & QR mua sắm thông minh.
                </p>
            </header>

            {/* HÀNG 1: AI VISION + BMI ANALYZER */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* AI VISION */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <IconCamera className="h-5 w-5 text-emerald-500" />
                        Phân tích ảnh món ăn
                    </h2>
                    <p className="text-sm text-slate-600">
                        Kéo ảnh món ăn của bạn vào khung dưới đây hoặc chọn file từ máy.
                        AI sẽ ước tính calories, chất béo, carb, protein và mức độ phù hợp
                        với EatClean.
                    </p>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-2 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 text-center transition ${dragActive
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 bg-slate-50"
                            }`}
                    >
                        {uploadPreview ? (
                            <img
                                src={uploadPreview}
                                alt="Preview"
                                className="mb-3 h-40 w-40 rounded-2xl object-cover shadow-sm"
                            />
                        ) : (
                            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                                <IconCamera className="h-7 w-7 text-emerald-500" />
                            </div>
                        )}

                        <p className="text-sm text-slate-600">
                            Kéo & thả ảnh vào đây <br />
                            <span className="text-xs text-slate-400">
                                hoặc bấm nút bên dưới để chọn ảnh từ máy
                            </span>
                        </p>
                        <label className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-600">
                            Chọn ảnh từ máy
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {visionError && (
                        <p className="mt-3 text-xs text-red-600">{visionError}</p>
                    )}

                    {visionData && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-800">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                    Tóm tắt dinh dưỡng
                                </p>
                                <ul className="space-y-1 text-xs">
                                    <li>
                                        <span className="font-semibold">Calories:</span>{" "}
                                        {visionData.calories ?? "?"} kcal
                                    </li>
                                    <li>
                                        <span className="font-semibold">Carb:</span>{" "}
                                        {visionData.carb ?? "?"} g
                                    </li>
                                    <li>
                                        <span className="font-semibold">Fat:</span>{" "}
                                        {visionData.fat ?? "?"} g
                                    </li>
                                    <li>
                                        <span className="font-semibold">Protein:</span>{" "}
                                        {visionData.protein ?? "?"} g
                                    </li>
                                    <li>
                                        <span className="font-semibold">Dầu mỡ:</span>{" "}
                                        {visionData.oil_level ?? "?"}
                                    </li>
                                    <li>
                                        <span className="font-semibold">Phù hợp EatClean:</span>{" "}
                                        {visionData.is_eatclean ? "Có" : "Không/Chưa tối ưu"}
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
                                <p className="mb-1 font-semibold text-slate-900">
                                    Nhận xét nhanh
                                </p>
                                <p className="mb-2">
                                    {visionData.short_summary ||
                                        "AI đang cố gắng phân tích ảnh món ăn của bạn."}
                                </p>
                                {visionData.warnings?.length ? (
                                    <>
                                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                                            Cảnh báo:
                                        </p>
                                        <ul className="mt-1 list-disc pl-4">
                                            {visionData.warnings.map((w, idx) => (
                                                <li key={idx}>{w}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    )}
                </section>

                {/* BMI ANALYZER */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Phân tích BMI & mỡ cơ thể (AI)
                    </h2>
                    <p className="text-sm text-slate-600">
                        Nhập chiều cao, cân nặng, vòng bụng và mục tiêu. AI sẽ phân tích
                        BMI, ước tính body fat, mỡ nội tạng và gợi ý thói quen ăn uống.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Chiều cao (cm)
                            </label>
                            <input
                                type="number"
                                value={bmiForm.height}
                                onChange={(e) =>
                                    handleBmiChange("height", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                placeholder="VD: 165"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Cân nặng (kg)
                            </label>
                            <input
                                type="number"
                                value={bmiForm.weight}
                                onChange={(e) =>
                                    handleBmiChange("weight", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                placeholder="VD: 65"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Vòng bụng (cm)
                            </label>
                            <input
                                type="number"
                                value={bmiForm.waist}
                                onChange={(e) =>
                                    handleBmiChange("waist", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Có thể để trống"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Mỡ bụng dưới
                            </label>
                            <select
                                value={bmiForm.bellyFat}
                                onChange={(e) =>
                                    handleBmiChange("bellyFat", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="low">Thấp</option>
                                <option value="medium">Vừa</option>
                                <option value="high">Cao</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Mức vận động
                            </label>
                            <select
                                value={bmiForm.activity}
                                onChange={(e) =>
                                    handleBmiChange("activity", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="low">Ít vận động</option>
                                <option value="moderate">Vận động vừa</option>
                                <option value="high">Vận động nhiều</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">
                                Mục tiêu
                            </label>
                            <select
                                value={bmiForm.goal}
                                onChange={(e) =>
                                    handleBmiChange("goal", e.target.value)
                                }
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            >
                                <option value="lose_weight">Giảm cân</option>
                                <option value="maintain">Giữ cân</option>
                                <option value="gain_muscle">Tăng cơ</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={callBmiAI}
                        className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-600"
                    >
                        Phân tích BMI bằng AI
                    </button>

                    {bmiAnalysis && (
                        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700 space-y-2">
                            {bmiAnalysis.error ? (
                                <p className="text-red-600">{bmiAnalysis.error}</p>
                            ) : (
                                <>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Kết quả BMI:{" "}
                                        {bmiAnalysis.bmi
                                            ? bmiAnalysis.bmi.toFixed(1)
                                            : computeBmiSimple()?.toFixed(1)}
                                    </p>
                                    {bmiAnalysis.body_fat && (
                                        <p>
                                            <span className="font-semibold">Body fat ước tính:</span>{" "}
                                            {bmiAnalysis.body_fat.toFixed(1)}%
                                        </p>
                                    )}
                                    {bmiAnalysis.visceral_fat_level && (
                                        <p>
                                            <span className="font-semibold">
                                                Mỡ nội tạng (visceral fat):
                                            </span>{" "}
                                            {bmiAnalysis.visceral_fat_level}
                                        </p>
                                    )}
                                    {bmiAnalysis.calories_burn && (
                                        <p>
                                            <span className="font-semibold">
                                                Năng lượng tiêu hao mỗi ngày:
                                            </span>{" "}
                                            {Math.round(bmiAnalysis.calories_burn)} kcal
                                        </p>
                                    )}
                                    {bmiAnalysis.summary && (
                                        <p className="mt-1">{bmiAnalysis.summary}</p>
                                    )}

                                    {bmiAnalysis.nutrition_advice && (
                                        <div className="mt-2 grid gap-2 md:grid-cols-3">
                                            <div>
                                                <p className="font-semibold text-emerald-700">
                                                    Nên ăn nhiều
                                                </p>
                                                <ul className="mt-1 list-disc pl-4">
                                                    {bmiAnalysis.nutrition_advice.eat_more?.map(
                                                        (item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-red-600">
                                                    Hạn chế / tránh
                                                </p>
                                                <ul className="mt-1 list-disc pl-4">
                                                    {bmiAnalysis.nutrition_advice.avoid?.map(
                                                        (item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    Thói quen nên duy trì
                                                </p>
                                                <ul className="mt-1 list-disc pl-4">
                                                    {bmiAnalysis.nutrition_advice.habits?.map(
                                                        (item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* HÀNG 2: GỢI Ý THỰC PHẨM + MEAL PLAN */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                {/* GỢI Ý THỰC PHẨM */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Thực phẩm EatClean gợi ý cho bạn
                    </h2>
                    <p className="text-xs text-slate-500">
                        Cá nhân hóa theo BMI và mức độ "dầu mỡ" của món ăn bạn vừa phân
                        tích. Đây là nguyên liệu để bạn nấu các món EatClean phù hợp.
                    </p>

                    {ingredientSuggestions.length === 0 && (
                        <p className="text-sm text-slate-600">
                            Hãy tải một ảnh món ăn hoặc phân tích BMI để hệ thống hiểu bạn
                            hơn nhé.
                        </p>
                    )}

                    {ingredientSuggestions.length > 0 && (
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            {ingredientSuggestions.map((p) => {
                                const inCart = cart.some((c) => c.id === p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className="flex flex-col rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-emerald-50 p-3 shadow-sm"
                                    >
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="h-28 w-full rounded-xl object-cover mb-2"
                                        />
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            {p.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {p.unit} · ~{p.calories} kcal/100g
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-emerald-600">
                                            {p.price.toLocaleString("vi-VN")}đ
                                        </p>
                                        <button
                                            onClick={() => addToCart(p)}
                                            disabled={inCart}
                                            className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${inCart
                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                                                }`}
                                        >
                                            <IconCart className="h-3 w-3" />
                                            {inCart ? "Đã trong giỏ" : "Thêm vào giỏ"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* MEAL PLAN 7 NGÀY */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Thực đơn EatClean 7 ngày (AI)
                    </h2>
                    <p className="text-xs text-slate-500">
                        Dựa trên BMI, mục tiêu & mức vận động, AI sẽ gợi ý thực đơn EatClean
                        7 ngày. Bạn có thể dùng như một kế hoạch tham khảo.
                    </p>

                    <button
                        type="button"
                        onClick={callMealPlanAI}
                        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-600"
                    >
                        Tạo thực đơn 7 ngày
                    </button>

                    {mealPlan?.error && (
                        <p className="mt-2 text-xs text-red-600">{mealPlan.error}</p>
                    )}

                    {mealPlan?.days && (
                        <div className="mt-3 max-h-80 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                            {Object.entries(mealPlan.days).map(([dayKey, dayData]) => (
                                <div key={dayKey} className="mb-3 last:mb-0">
                                    <p className="font-semibold text-slate-900">
                                        {dayKey.toUpperCase()}
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                        {["breakfast", "lunch", "dinner"].map((mealKey) => {
                                            const meal = dayData[mealKey];
                                            if (!meal) return null;
                                            return (
                                                <li key={mealKey}>
                                                    <span className="font-semibold">
                                                        {mealKey === "breakfast"
                                                            ? "Sáng"
                                                            : mealKey === "lunch"
                                                                ? "Trưa"
                                                                : "Tối"}
                                                        :
                                                    </span>{" "}
                                                    {meal.name} ·{" "}
                                                    {meal.calories ? `${meal.calories} kcal` : "?"}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {shoppingList && (
                        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs">
                            <p className="mb-1 font-semibold text-emerald-800">
                                Shopping list cho 7 ngày
                            </p>
                            <ul className="mt-1 space-y-1">
                                {Object.entries(shoppingList).map(([name, qty]) => (
                                    <li key={name} className="flex justify-between gap-2">
                                        <span>{name}</span>
                                        <span className="font-semibold text-emerald-700">
                                            {qty}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            </div>

            {/* HÀNG 3: SIÊU THỊ + QR BILL + LỊCH SỬ */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                {/* SIÊU THỊ + QR BILL */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <IconMap className="h-5 w-5 text-emerald-500" />
                        Siêu thị & QR nhận hàng
                    </h2>

                    {!nearestMarket && (
                        <p className="text-sm text-slate-600">
                            Đang xác định siêu thị gần bạn nhất...
                        </p>
                    )}
                    {nearestMarket && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                            <p className="font-semibold text-emerald-700">
                                {nearestMarket.market.name}
                            </p>
                            <p>{nearestMarket.market.address}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                ⏰ {nearestMarket.market.open}{" "}
                                {nearestMarket.dist != null &&
                                    `• Cách bạn khoảng ${nearestMarket.dist.toFixed(
                                        2
                                    )} km`}
                            </p>
                        </div>
                    )}

                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            🛒 Giỏ hàng EatClean
                        </h3>
                        {cart.length === 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                                Chưa có món nào. Hãy thêm thực phẩm EatClean từ gợi ý bên trên.
                            </p>
                        )}
                        {cart.length > 0 && (
                            <>
                                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                                    {cart.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex justify-between gap-2"
                                        >
                                            <span>
                                                {item.name}{" "}
                                                <span className="text-xs text-slate-400">
                                                    ({item.unit})
                                                </span>
                                            </span>
                                            <span className="font-medium text-emerald-600">
                                                {item.price.toLocaleString("vi-VN")}đ
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-sm font-semibold text-emerald-700">
                                    Tổng cộng: {totalPrice.toLocaleString("vi-VN")}đ
                                </p>
                                <button
                                    onClick={() => setShowQr(true)}
                                    className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                                >
                                    Tạo mã QR để nhận hàng
                                </button>
                            </>
                        )}

                        {showQr && cart.length > 0 && (
                            <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                <QRCode value={qrPayload} size={164} />
                                <p className="text-xs text-emerald-700 text-center">
                                    Quét QR tại quầy thanh toán siêu thị để nhận đúng combo
                                    EatClean của bạn.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* LỊCH SỬ PHÂN TÍCH + BMI */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Lịch sử sức khỏe gần đây
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2 text-xs">
                        {/* Lịch sử ảnh */}
                        <div>
                            <p className="mb-1 font-semibold text-slate-900">
                                Ảnh món ăn đã phân tích
                            </p>
                            {visionHistory.length === 0 && (
                                <p className="text-slate-500">
                                    Chưa có lịch sử phân tích ảnh.
                                </p>
                            )}
                            {visionHistory.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {visionHistory.map((h) => (
                                        <div
                                            key={h.id}
                                            className="min-w-[140px] max-w-[160px] rounded-2xl border border-slate-100 bg-slate-50 p-2"
                                        >
                                            <img
                                                src={h.image}
                                                alt="history"
                                                className="mb-1 h-20 w-full rounded-xl object-cover"
                                            />
                                            <p className="text-[10px] text-slate-500">
                                                {new Date(
                                                    h.createdAt
                                                ).toLocaleString("vi-VN")}
                                            </p>
                                            {h.result?.calories && (
                                                <p className="mt-1 text-[11px]">
                                                    {h.result.calories} kcal ·{" "}
                                                    {h.result.oil_level || "?"} dầu mỡ
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lịch sử BMI */}
                        <div>
                            <p className="mb-1 font-semibold text-slate-900">
                                Lịch sử BMI
                            </p>
                            {bmiHistory.length === 0 && (
                                <p className="text-slate-500">
                                    Chưa có lịch sử BMI. Hãy phân tích BMI ít nhất 1 lần.
                                </p>
                            )}
                            {bmiHistory.length > 0 && (
                                <ul className="space-y-1">
                                    {bmiHistory.slice(0, 6).map((h) => (
                                        <li
                                            key={h.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                                        >
                                            <div>
                                                <p className="text-[11px] text-slate-500">
                                                    {new Date(
                                                        h.createdAt
                                                    ).toLocaleDateString("vi-VN")}{" "}
                                                    • BMI{" "}
                                                    {h.bmi ? h.bmi.toFixed(1) : "?"}
                                                </p>
                                                {h.body_fat && (
                                                    <p className="text-[11px] text-slate-600">
                                                        Body fat: {h.body_fat.toFixed(1)}%
                                                    </p>
                                                )}
                                            </div>
                                            {h.goal && (
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                    {h.goal === "lose_weight"
                                                        ? "Giảm cân"
                                                        : h.goal === "maintain"
                                                            ? "Giữ cân"
                                                            : "Tăng cơ"}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default EatClean;
