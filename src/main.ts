let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function queryWeather() {
  if (greetMsgEl && greetInputEl) {
    const city = greetInputEl.value || "Beijing";
    greetMsgEl.textContent = "正在获取云端天气数据...";

    try {
      // 使用 wttr.in 这种不需要 Key 的服务
      const response = await fetch(`https://wttr.in/${city}?format=j1`);
      const data = await response.json();
      const current = data.current_condition[0];

      greetMsgEl.innerHTML = `
        <b>${city}</b>: ${current.temp_C}℃ <br/>
        体感: ${current.feelsLikeC}℃ <br/>
        描述: ${current.weatherDesc[0].value}
      `;
    } catch (err) {
      greetMsgEl.textContent = "天气服务暂不可用，请检查网络";
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    queryWeather();
  });
});