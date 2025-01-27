document.addEventListener("DOMContentLoaded", () => {
    const addStickerButton = document.getElementById("add-sticker");
    const stickersContainer = document.getElementById("stickers-container");
    const colors = ["#FFD700", "#FF6347", "#90EE90", "#87CEEB", "#FFA07A", "#DDA0DD"];

    loadStickers();

    addStickerButton.addEventListener("click", () => {
        createSticker();
    });


    function getMaxZIndex() {
        let maxZ = 1;
        document.querySelectorAll(".sticker").forEach(sticker => {
            const z = parseInt(sticker.style.zIndex) || 1;
            if (z > maxZ) maxZ = z;
        });
        return maxZ;
    }


    async function getRandomRussianText() {
        try {
            const response = await fetch("https://fish-text.ru/get?type=title&format=json");
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error("Ошибка при получении текста:", error);
            return "интересная мысль";
        }
    }


    async function createSticker(text = "", x = null, y = null, color = null, zIndex = null) {
        const sticker = document.createElement("div");
        sticker.classList.add("sticker");
        sticker.style.backgroundColor = color || colors[Math.floor(Math.random() * colors.length)];

        const maxZ = getMaxZIndex();
        sticker.style.zIndex = zIndex !== null ? zIndex : maxZ + 1;

        const textarea = document.createElement("textarea");
        textarea.classList.add("sticker-text");
        textarea.value = text;
        textarea.maxLength = 200;

        const randomText = await getRandomRussianText();
        textarea.placeholder = `Напишите что-нибудь, например: ${randomText}`;

        textarea.addEventListener("input", () => {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
            if (textarea.value.length > 0) {
                textarea.placeholder = "";
            } else {
                textarea.placeholder = `Напишите что-нибудь, например: ${randomText}`;
            }
            saveStickers();
        });

        textarea.addEventListener("mousedown", (event) => {
            event.stopPropagation();
        });

        const deleteButton = document.createElement("span");
        deleteButton.innerText = "❌";
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", () => {
            sticker.remove();
            saveStickers();
        });

        sticker.appendChild(textarea);
        sticker.appendChild(deleteButton);

        const boardRect = stickersContainer.getBoundingClientRect();
        sticker.style.left = `${x !== null ? x : Math.random() * (boardRect.width - 225)}px`;
        sticker.style.top = `${y !== null ? y : Math.random() * (boardRect.height - 225)}px`;

        sticker.addEventListener("mousedown", dragStart);
        stickersContainer.appendChild(sticker);
        saveStickers();
    }


    function dragStart(event) {
        const sticker = event.target.closest(".sticker");
        if (!sticker || event.target.classList.contains("delete-btn")) return;
        sticker.classList.add("dragging");

        const maxZ = getMaxZIndex();
        sticker.style.zIndex = maxZ + 1;

        let shiftX = event.clientX - sticker.getBoundingClientRect().left;
        let shiftY = event.clientY - sticker.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            const boardRect = stickersContainer.getBoundingClientRect();
            let newX = pageX - shiftX - boardRect.left;
            let newY = pageY - shiftY - boardRect.top;

            newX = Math.max(0, Math.min(newX, boardRect.width - sticker.offsetWidth));
            newY = Math.max(0, Math.min(newY, boardRect.height - sticker.offsetHeight));

            sticker.style.left = `${newX}px`;
            sticker.style.top = `${newY}px`;
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener("mousemove", onMouseMove);

        document.addEventListener("mouseup", function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            sticker.classList.remove("dragging");
            saveStickers();
        }, { once: true });

        moveAt(event.pageX, event.pageY);
    }


    function saveStickers() {
        const stickers = [];
        document.querySelectorAll(".sticker").forEach(sticker => {
            const textarea = sticker.querySelector(".sticker-text"); // Берём текст из textarea
            stickers.push({
                text: textarea.value, // Сохраняем корректно
                x: parseInt(sticker.style.left),
                y: parseInt(sticker.style.top),
                color: sticker.style.backgroundColor,
                zIndex: parseInt(sticker.style.zIndex) // Сохраняем z-index
            });
        });
        localStorage.setItem("stickers", JSON.stringify(stickers));
    }


    function loadStickers() {
        const stickers = JSON.parse(localStorage.getItem("stickers")) || [];
        stickers.forEach(({ text, x, y, color, zIndex }) => {
            createSticker(text, x, y, color, zIndex);
        });
    }
});
