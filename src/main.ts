const cityInput = document.querySelector("#city-input") as HTMLInputElement;
const display = document.querySelector("#weather-display") as HTMLElement;
const app = document.querySelector("#app") as HTMLElement;
const hourlyEl = document.querySelector("#hourly") as HTMLElement;
const detailsEl = document.querySelector("#details") as HTMLElement;
const placeholderEl = document.querySelector("#placeholder") as HTMLElement;

const cityNameEl = document.querySelector(".city-name") as HTMLElement;
const descTextEl = document.querySelector(".desc-text") as HTMLElement;
const tempValEl = document.querySelector(".temp-val") as HTMLElement;
const weatherIconEl = document.querySelector("#weather-icon") as HTMLElement;

// 天气现象到主题的映射
const themeMap: Record<string, string> = {
  "Clear": "sunny", "Sunny": "sunny",
  "Cloudy": "cloudy", "Overcast": "cloudy", "Partly cloudy": "cloudy",
  "Rain": "rainy", "Light rain": "rainy", "Thunder": "rainy", "Showers": "rainy"
};

function setPlaceholder(text: string) {
  if (placeholderEl) placeholderEl.textContent = text;
}

function formatHour(t: string) {
  // wttr.in hourly time can be "0", "300", "600" ...
  const n = Number(t) || 0;
  const hour = Math.floor(n / 100);
  return `${String(hour).padStart(2, "0")}时`;
}

async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  setPlaceholder(`正在获取 ${city} 的天气...`);

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    const current = data.current_condition[0];
    const weatherDescEn = current.weatherDesc?.[0]?.value || "";
    const weatherDescZh = (current.lang_zh && current.lang_zh[0] && current.lang_zh[0].value) || current.weatherDesc?.[0]?.value || "--";

    const theme = updateTheme(weatherDescEn);

    // 更新顶部主视图
    if (cityNameEl) cityNameEl.textContent = city;
    if (tempValEl) tempValEl.textContent = `${current.temp_C}`;
    if (descTextEl) descTextEl.textContent = weatherDescZh;
    if (weatherIconEl) {
      // reset
      weatherIconEl.style.backgroundImage = "";
      weatherIconEl.className = "weather-icon";
      if (current.weatherIconUrl && current.weatherIconUrl[0]) {
        weatherIconEl.style.backgroundImage = `url(${current.weatherIconUrl[0].value})`;
      } else if (theme) {
        weatherIconEl.classList.add(theme);
      }
    }

    // 小时预报（取当天）
    const today = data.weather && data.weather[0] ? data.weather[0] : null;
    if (hourlyEl) {
      hourlyEl.innerHTML = "";
      if (today && today.hourly) {
        today.hourly.forEach((h: any) => {
          const item = document.createElement("div");
          item.className = "hourly-item";
          item.innerHTML = `
            <div class="hour">${formatHour(h.time)}</div>
            <div class="h-icon" style="width:28px;height:28px;margin:6px auto;background-image:url(${h.weatherIconUrl?.[0]?.value});background-size:cover;background-position:center"></div>
            <div class="h-temp">${h.tempC}°</div>
          `;
          hourlyEl.appendChild(item);
        });
      }
    }

    // 微交互：为主要区域添加淡入动画
    const applyFade = (el: HTMLElement | null) => {
      if (!el) return;
      el.classList.remove("fade-in");
      void el.offsetWidth;
      el.classList.add("fade-in");
    };

    applyFade(cityNameEl);
    applyFade(tempValEl);
    applyFade(descTextEl);
    applyFade(hourlyEl);
    applyFade(detailsEl);

    // 详情卡
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="card">
          <span class="card-label">体感温度</span>
          <span class="card-value">${current.FeelsLikeC}°C</span>
        </div>
        <div class="card">
          <span class="card-label">湿度</span>
          <span class="card-value">${current.humidity}%</span>
        </div>
        <div class="card">
          <span class="card-label">风速</span>
          <span class="card-value">${current.windspeedKmph} km/h</span>
        </div>
        <div class="card">
          <span class="card-label">能见度</span>
          <span class="card-value">${current.visibility} km</span>
        </div>
      `;
    }

    setPlaceholder("");
  } catch (err) {
    setPlaceholder("抱歉，未找到该城市 (请尝试拼音)");
  }
}

function updateTheme(descEn: string) {
  if (!app) return;
  // 清除以 weather-theme- 开头的类
  Array.from(app.classList).forEach((c) => {
    if (c.startsWith("weather-theme-")) app.classList.remove(c);
  });
  let theme = "sunny";
  for (const key in themeMap) {
    if (descEn.includes(key)) {
      theme = themeMap[key];
      break;
    }
  }
  app.classList.add(`weather-theme-${theme}`);
  return theme;
}

// 去抖函数
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 600) {
  let t: number | undefined;
  return (...args: any[]) => {
    if (t) clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}

window.addEventListener("DOMContentLoaded", () => {
  cityInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") fetchWeather();
  });

  const searchHint = document.querySelector(".search-hint");
  searchHint?.addEventListener("click", () => fetchWeather());

  cityInput?.addEventListener("input", debounce(() => {
    // 自动搜索：取消注释下面一行可启用自动搜索
    fetchWeather();
  }, 800));
});