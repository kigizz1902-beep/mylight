# 비 오는 창문 애니메이션

`index.html`을 브라우저에서 열면 실행됩니다. 별도 라이브러리나 설치는 필요하지 않습니다.

## 현재 이미지에 맞춘 핵심 설정

창문 마스크의 좌표는 `styles.css` 상단에 있습니다.

```css
--window-left: 78.35%;
--window-top: 0%;
--window-width: 18.9%;
--window-height: 39.2%;
```

이미지 구도가 달라지면 이 네 값만 조절하면 됩니다. 비의 양과 속도는 `rain.js`의 `CONFIG`에서 바꿀 수 있습니다.

```js
streakCount: 74, // 빗줄기 수
beadCount: 16,   // 유리 위 물방울 수
wind: 24,        // 비가 기우는 정도
minSpeed: 250,
maxSpeed: 510,
```

## 기존 화면에 붙일 때

1. ON/OFF 이미지를 같은 크기로 겹칩니다.
2. `.rain-window`를 이미지 컨테이너 안에 넣습니다.
3. 이미지 컨테이너에는 `position: relative`와 `overflow: hidden`을 적용합니다.
4. ON 이미지의 `opacity`를 변경하면 조명이 서서히 켜지고 꺼집니다.

발표용이라면 화면의 버튼을 숨기고, 원하는 시점에 아래 클래스를 자바스크립트로 제어하면 됩니다.

```js
scene.classList.add("is-lamp-off");     // 조명 OFF
scene.classList.remove("is-lamp-off");  // 조명 ON
scene.classList.add("is-rain-paused");  // 비 멈춤
```
