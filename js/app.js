new Vue({
    el: '#monster-killer',
    data: {
        newGame: false,
        result: false,
        round: 1,
        player: {
            attack: {
                min: 5,
                max: 10,
            },
            life: 100,

        },
        monster: {
            attack: {
                min: 6,
                max: 12
            },
            life: 100,

        },
        battleLog: [],
        volume: 0.2,
        muted: true,
        credits: false,
        userInteraction: false,
    },
    methods: {
        random(min, max){
            return parseInt( ((max - min) * Math.random() ) + min)
        },
        log(action, values){
            const round = `Round-${this.round++}`
            const oponents = ['player', 'monster']
            let roundLog = []
            
            for(i = 0; i < 2; i ++){
                const j = i == 1 ? 0 : 1
                
                let target = oponents[j]
                if (oponents[i] === 'player' && action.search(/ataque/) === -1){
                    target = ''                    
                } 

                const obj = {
                    executor: oponents[i],
                    target,
                    action: oponents[i] === 'player' ? action : 'Realizou ataque de',
                    value: values[`${oponents[i]}Attack`]
                }
                roundLog.push(obj)
            }

            this.battleLog.unshift({ [round]: roundLog })
        },
        calibrate(bonus){
            const monster = this.monster
            const player = this.player
            const maxAttack = bonus ? player.attack.min + player.attack.max : player.attack.max
            return {
                monster,
                player,
                monsterAttack: this.random(monster.attack.min, monster.attack.max),
                playerAttack: this.random(player.attack.min, maxAttack),
            }
        },
        lifeManagment(playerAttack, monsterAttack){
            const {monster, player} = this.calibrate(false)
            
            /** ORIGINAL 
                monster.life -= playerAttack
                monster.life = monster.life < 0 ? 0 : monster.life
            */  
            // Adicionado após assistir aula
            monster.life = Math.max(monster.life -= playerAttack, 0)
            
            player.life -= monsterAttack
            if(player.life < 0){
                player.life = 0
            } else if(player.life > 100) {
                player.life = 100
            }
            
        },
        attack(){
            this.attackSound()
            const {monsterAttack, playerAttack} = this.calibrate(false)
            this.lifeManagment(playerAttack, monsterAttack)         
            this.log('Realizou ataque de', {playerAttack, monsterAttack} )
        },
        specialAttack(){
            this.specialAttackSound()
            const {monsterAttack, playerAttack} = this.calibrate(true)
            this.lifeManagment(playerAttack, monsterAttack)
            this.log('Realizou ataque especial de', {playerAttack, monsterAttack})            
        },
        heal(){
            this.healingSound()
            const {monsterAttack, playerAttack} = this.calibrate(true)
            const heal = -(playerAttack - monsterAttack)
            this.lifeManagment(0, heal)
            this.log('Curou-se em', {playerAttack, monsterAttack})
        },
        restart(){
            this.player.life = 100
            this.monster.life = 100
            this.battleLog = []
            this.result = false
            this.round = 1
        },
        giveUp(){
            this.giveUpSound()
            this.restart()
            this.newGame = false
        },
        startGame(){
            this.startGameSound()
            this.restart()
            this.newGame = true
        },
        oddOrEven(i){
            const odd = i % 2 === 0 ? true : false
            return {odd: odd, even:!odd}
        },
        translate(word){
            switch(word){
                case 'player':
                    return 'jogador'
                case 'monster':
                    return 'monstro'
                default: 
                    return ''
            }
        },
        soundOff(){
            this.volume = 0
            this.muted = true
        },
        soundOn(){
            const audio = this.$refs.soundtrack
            this.volume = 0.2
            this.muted = false
            let prom = audio.play()

            if( prom !== undefined){
                prom.then(_ => {
                    this.userInteraction = true
                }).catch(error => {
                    console.log('Não deu pra tocar: ', error)

                })
            }
        },
        changeVolume(event){
            this.volume = event.target.value / 100
        },
        startGameSound(){
            this.$refs.gameOn.play()
        },
        specialAttackSound(){
            const audio = this.$refs.especialAttackSound
            audio.currentTime = 0
            audio.play()
        },
        healingSound(){
            const audio = this.$refs.healingSpell
            audio.currentTime = 0
            audio.play()
            let int = setInterval(function() {
                if (audio.currentTime > 1.8) {
                    audio.pause();
                    clearInterval(int);
                }
            }, 10);
        },
        attackSound(){
            const audio = this.$refs.attackSound
            audio.currentTime = 0.6
            audio.play()
            let int = setInterval(function() {
                if (audio.currentTime > 4) {
                    audio.pause();
                    clearInterval(int);
                }
            }, 10);
        },
        giveUpSound(){
            const audio = this.$refs.giveUpSound
            audio.currentTime = 5
            audio.play()
            let int = setInterval(function() {
                if (audio.currentTime > 8) {
                    audio.pause();
                    clearInterval(int);
                }
            }, 10);
        },

    },
    mounted(){
        this.soundOff()
     },
    computed:{
        playerIsDying(){
            const dying = this.player.life <= 20 ? true : false
            return {dying}
        },
        monsterIsDying(){
            const dying =  this.monster.life <= 20 ? true : false
            return {dying}
        },
        winnerOrLoser(){
            const loser = this.monster.life > 0 ? true : false
            return {loser, winner: !loser}
        },
    },
    watch:{
        battleLog(){
            if(this.monster.life <= 0 || this.player.life <= 0){
                this.newGame = false
                this.result = true
            }          
        },
        volume(novoVolume){
            this.$refs.soundtrack.volume = novoVolume
            this.$refs.gameOn.volume = novoVolume
            this.$refs.attackSound.volume = novoVolume
            this.$refs.especialAttackSound.volume = novoVolume
            this.$refs.healingSpell.volume = novoVolume
            this.$refs.giveUpSound.volume = novoVolume
        }
    }
})