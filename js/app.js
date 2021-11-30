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

            this.battleLog.push({ [round]: roundLog })
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
            
            monster.life -= playerAttack
            monster.life = monster.life < 0 ? 0 : monster.life
            
            player.life -= monsterAttack
            if(player.life < 0){
                player.life = 0
            } else if(player.life > 100) {
                player.life = 100
            }
            
        },
        attack(){
            const {monsterAttack, playerAttack} = this.calibrate(false)
            this.lifeManagment(playerAttack, monsterAttack)         
            this.log('Realizou ataque de', {playerAttack, monsterAttack} )
        },
        specialAttack(){
            const {monsterAttack, playerAttack} = this.calibrate(true)
            this.lifeManagment(playerAttack, monsterAttack)
            this.log('Realizou ataque especial de', {playerAttack, monsterAttack})
        },
        heal(){
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
            this.restart()
            this.newGame = false
        },
        startGame(){
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
        }

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
        }
    }
})