//全局函数
const $ = selecto => document.querySelector(selecto);

//
const content = $('.content');
const startGame = $('.start_game');
const game = $('.game');
const start = $('.start')
const score = $('.score')
const score1 = $('.score1')
const recur = $('recur')
const over = $('.over')
const hp = $('.hp')
const hpUl = $('.hp_ul')
let hpLis = []



var keydown
let scoreNow = 0;

class Plane {
    constructor(hp, speed, src, type, orientation, offset, size) {
        this.hp = hp;
        this.speed = speed;
        this.src = src;
        this.type = type;
        this.orientation = orientation;
        this.offset = offset;
        this.size = size;
    }
    create() {
        const element = document.createElement('img');
        element.src = this.src;
        element.style.width = this.size.w + 'px';
        element.style.height = this.size.h + 'px';
        element.style.position = 'absolute';
        element.style.left = this.offset.x + 'px';
        element.style.top = this.offset.y + 'px';
        game.appendChild(element);

        this.ele = element;
        element.obj = this;
    }
    move(orientation) {

        if (orientation == 's' || orientation == 'S' || orientation == 'ArrowDown') {
            if (!(this.offset.y > content.offsetHeight - this.size.h)) {
                this.offset.y += this.speed;
                this.ele.style.top = this.offset.y + 'px';
            }
        } else if (orientation == 'a' || orientation == 'A' || orientation == 'ArrowLeft') {
            if (this.offset.x > -20) {
                this.offset.x -= this.speed;
                this.ele.style.left = this.offset.x + 'px';
            }
        } else if (orientation == 'd' || orientation == 'D' || orientation == 'ArrowRight') {
            if (this.offset.x < content.offsetWidth - 45) {
                this.offset.x += this.speed;
                this.ele.style.left = this.offset.x + 'px';
            }
        } else if (orientation == 'w' || orientation == 'W' || orientation == 'ArrowUp') {
            if (!(this.offset.y < 0)) {
                this.offset.y -= this.speed;
                this.ele.style.top = this.offset.y + 'px';
            }
        }
        if (this.type != 'myPlane') {
            if (this.offset.x < 0 || this.offset.x > content.offsetWidth || this.offset.y < 0 || this.offset.y > content.offsetHeight - this.size.h) {
                this.kill()
            }
        }

        if (this.ele !== null) {
            this.impact(this.ele.getBoundingClientRect().left, this.ele.getBoundingClientRect().top)
        }
    }

    impact(x, y) {
        let eles = document.elementsFromPoint(x, y)
        const all = {}
        eles.forEach(e => {
            if (e.tagName == 'IMG') {
                if (myPlane.hp > 0) {
                    all[e.obj.type] = e.obj
                }
            }
        })
        if (Object.keys(all).length == 1) {
            return
        } else {
            if (all['myPlane'] && all['bullet']) {
                return;
            }
            if (all['enemy'] && all['bullet']) {
                all['bullet'].kill();
                scoreNow++;
                score.innerText = scoreNow;
                const enemyExplodeEle = all['enemy'].explode('./imgs/enemy_explode.gif');
                setTimeout(function () {
                    enemyExplodeEle.remove()
                }, 500)
                return;
            } else if (all['enemy'] && all['myPlane']) {
                all['enemy'].kill();
                all['myPlane'].hp--
                if (all['myPlane'].hp >= 0) {
                    hpLis[all['myPlane'].hp].style.backgroundColor = 'rgba(0,0,0,0)'
                }
                if (all['myPlane'].hp == 0) {
                    all['myPlane'].kill();
                    window.onkeydown = null;
                    clearInterval(creationEnemy);
                    clearInterval(creationBullet);
                    clearInterval(bg);
                    over.style.display = 'block';
                    score1.innerText = score.innerText;
                    const enemyExplodeEle = all['myPlane'].explode('./imgs/myPlane_explode.gif');
                    setTimeout(function () {
                        enemyExplodeEle.remove()
                    }, 2000)
                }
            }
        }

    }

    kill() {
        if (this.ele == null) {
            return;
        }
        this.ele.remove()
        clearInterval(this.timer)
        this.ele.obj = null
        this.ele = null
    }

    moveFn(key) {
        this.move(key.key)
    }

    explode(src) {
        this.kill()
        const enemyExplode = document.createElement('div');
        enemyExplode.style.background = `url(${src})`
        enemyExplode.style.backgroundSize = 'cover';
        enemyExplode.style.width = this.size.w + 'px';
        enemyExplode.style.height = this.size.h + 'px';
        enemyExplode.style.position = 'absolute';
        enemyExplode.style.left = this.offset.x + 'px';
        enemyExplode.style.top = this.offset.y + 'px';
        game.appendChild(enemyExplode);

        return enemyExplode;
    }
}

startGame.onclick = playGame
over.onclick = playGame


function playGame() {
    scoreNow = 0;
    hpUl.innerHTML = "";

    const w = content.offsetHeight;
    const h = content.offsetWidth;

    game.style.display = 'block'
    score.innerText = scoreNow;
    start.style.display = 'none'
    over.style.display = 'none'

    myPlane = new Plane(1, 5, './imgs/myplane.gif', 'myPlane', 'd', {
        x: h / 2 - 33,
        y: w - 80
    }, {
        w: 66,
        h: 80
    })

    for (let i = 0; i < myPlane.hp; i++) {
        hpLis[i] = document.createElement('li')
        hpUl.appendChild(hpLis[i])
    }

    myPlane.create()


    window.onkeydown = myPlane.moveFn.bind(myPlane)

    creationEnemy = setInterval(function () {
        const enemy = new Plane(1, 2, './imgs/enemy.png', 'enemy', 'S', {
            x: Math.floor(Math.random() * 295),
            y: 30
        }, {
            w: 26,
            h: 30
        })
        enemy.create()
        enemy.timer = setInterval(function () {
            enemy.move(enemy.orientation)
        }, 10);
    }, 1000)

    creationBullet = setInterval(function () {
        const bullet = new Plane(1, 3, './imgs/bullet.png', 'bullet', 'w', {
            x: myPlane.offset.x + myPlane.size.w / 2 - 2,
            y: myPlane.offset.y - 14
        }, {
            w: 6,
            h: 14
        })
        bullet.create()
        bullet.timer = setInterval(function () {
            bullet.move(bullet.orientation)
        }, 10);
    }, 200)

    let offset = 0;
    bg = setInterval(function () {
        game.style.backgroundPosition = `0px ${offset--}px`
    }, 10)
}