document.addEventListener('DOMContentLoaded', () => {
    //<editor-fold desc="이유식 계산기 로직">
    const stages = {
        10: {
            name: '10배죽',
            age: '만 4~6개월',
            description: '아주 부드럽고 묽은 상태로, 이유식을 시작하거나 초기 적응에 적합한 단계예요.',
            ratios: { rice: 6, grains: 0, meat: 2, veg: 4, water: 88 }
        },
        7: {
            name: '7배죽',
            age: '만 7~9개월',
            description: '조금씩 농도를 높이며 다양한 재료를 시도하는 단계예요.',
            ratios: { rice: 8, grains: 2, meat: 4, veg: 6, water: 80 }
        },
        5: {
            name: '5배죽',
            age: '만 10~12개월',
            description: '부드럽지만 적당한 농도로, 가장 많이 사용하는 기본 단계예요.',
            ratios: { rice: 10, grains: 3, meat: 8, veg: 12, water: 67 }
        },
        3: {
            name: '3배죽',
            age: '만 10~12개월',
            description: '걸쭉한 식감으로 씹는 연습을 시작하는 단계예요.',
            ratios: { rice: 12, grains: 5, meat: 10, veg: 15, water: 58 }
        },
        2: {
            name: '2배죽(진밥)',
            age: '만 12개월 이후',
            description: '일반식으로 넘어가기 전, 밥 형태에 가까운 단계예요.',
            ratios: { rice: 18, grains: 10, meat: 15, veg: 20, water: 37 }
        }
    };

    const stageRadios = document.querySelectorAll('input[name="stage"]');
    const stageAge = document.getElementById('stage-age');
    const stageInfo = document.getElementById('stage-info');
    const form = document.getElementById('calculator-form');
    const amountInput = document.getElementById('amount');
    const resultsList = document.querySelector('.results');
    
    const riceBar = document.getElementById('rice-bar');
    const grainsBar = document.getElementById('grains-bar');
    const meatBar = document.getElementById('meat-bar');
    const vegBar = document.getElementById('veg-bar');
    const waterBar = document.getElementById('water-bar');

    function updateStageInfo() {
        const selectedStage = document.querySelector('input[name="stage"]:checked').value;
        const stageData = stages[selectedStage];

        stageAge.textContent = `👶 ${stageData.age}`;
        stageInfo.textContent = stageData.description;

        updateRatioBars(stageData.ratios);
    }

    function updateRatioBars(ratios) {
        const bars = {
            rice: riceBar,
            grains: grainsBar,
            meat: meatBar,
            veg: vegBar,
            water: waterBar
        };

        for (const [key, bar] of Object.entries(bars)) {
            if (!bar) continue;
            const percentage = ratios[key];
            bar.style.width = `${percentage}%`;
            bar.textContent = percentage > 5 ? `${percentage}%` : '';
        }
    }

    function calculate(e) {
        e.preventDefault();
        const selectedStage = document.querySelector('input[name="stage"]:checked').value;
        const stageData = stages[selectedStage];
        const totalAmount = parseInt(amountInput.value, 10);

        resultsList.innerHTML = '';

        if (isNaN(totalAmount) || totalAmount < 50 || totalAmount > 1200) {
            let errorMessage = '';
            if (isNaN(totalAmount)) {
                errorMessage = '양을 입력해주세요.';
            } else if (totalAmount < 50) {
                errorMessage = '최소 50g 이상 입력해주세요.';
            } else if (totalAmount > 1200) {
                errorMessage = '최대 1200g까지 입력할 수 있어요.';
            }
            resultsList.innerHTML = `<li class='error' style='justify-content: center; color: red;'>${errorMessage}</li>`;
            return;
        }

        const ingredients = {
            '쌀': Math.round(totalAmount * (stageData.ratios.rice / 100)),
            '잡곡': Math.round(totalAmount * (stageData.ratios.grains / 100)),
            '고기': Math.round(totalAmount * (stageData.ratios.meat / 100)),
            '야채': Math.round(totalAmount * (stageData.ratios.veg / 100)),
            '물': Math.round(totalAmount * (stageData.ratios.water / 100))
        };
        
        const icons = {
            '쌀': '🍚',
            '잡곡': '🌾',
            '고기': '🥩',
            '야채': '🥕',
            '물': '💧'
        };

        for (const [name, value] of Object.entries(ingredients)) {
            if (value > 0) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="icon">${icons[name]}</span>
                    <span class="name">${name}</span>
                    <span class="value">${value}${name === '물' ? 'ml' : 'g'}</span>
                `;
                resultsList.appendChild(li);
            }
        }
    }

    if (form) {
        stageRadios.forEach(radio => radio.addEventListener('change', updateStageInfo));
        form.addEventListener('submit', calculate);
        updateStageInfo();
    }
    //</editor-fold>

    //<editor-fold desc="추천 식재료 갤러리 로직">
    const galleries = {
        initial: document.getElementById('gallery-initial'),
        mid: document.getElementById('gallery-mid'),
        late: document.getElementById('gallery-late')
    };

    const modal = document.getElementById('ingredient-modal');
    const closeModalButton = document.querySelector('.close-button');

    function populateGalleries() {
        for (const stage in galleries) {
            const gallery = galleries[stage];
            if (gallery) {
                gallery.innerHTML = ''; // Clear existing items
                if (typeof ingredientsData !== 'undefined' && ingredientsData[stage]) {
                    ingredientsData[stage].forEach(ingredient => {
                        const item = document.createElement('div');
                        item.className = 'ingredient-item';

                        const img = document.createElement('img');
                        img.src = ingredient.img;
                        img.alt = ingredient.name;
                        // 이미지 로드 실패 시 기본 맘마 아이콘으로 대체
                        img.onerror = () => {
                            img.src = 'https://cdn-icons-png.flaticon.com/512/3050/3050130.png'; 
                            img.style.padding = '20px';
                            img.style.backgroundColor = '#f1f2f6';
                        };

                        const span = document.createElement('span');
                        span.textContent = ingredient.name;

                        item.appendChild(img);
                        item.appendChild(span);
                        
                        item.addEventListener('click', () => openModal(ingredient));
                        gallery.appendChild(item);
                    });
                }
            }
        }
    }

    function openModal(ingredient) {
        if (!modal) return;
        document.getElementById('modal-img').src = ingredient.img;
        document.getElementById('modal-title').textContent = ingredient.name;
        document.getElementById('modal-cleaning').textContent = ingredient.cleaning;
        document.getElementById('modal-cubing').textContent = ingredient.cubing;
        document.getElementById('modal-pairing').textContent = ingredient.pairing;
        document.getElementById('modal-notes').textContent = ingredient.notes;
        modal.style.display = 'block';
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = 'none';
    }

    if (modal) {
        closeModalButton.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                closeModal();
            }
        });
    }

    // 갤러리 좌/우 스크롤
    document.querySelectorAll('.gallery-row-container .arrow').forEach(arrow => {
        arrow.addEventListener('click', function() {
            const row = this.parentElement.querySelector('.gallery-row');
            const scrollAmount = this.classList.contains('prev') ? -300 : 300;
            row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    });

    populateGalleries();

    //</editor-fold>

    //<editor-fold desc="부드러운 스크롤링">
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    //</editor-fold>
});
