document.addEventListener('DOMContentLoaded', function() {
    $(document).ready(function() {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new SpeechRecognition();
        var isRecognitionActive = false;
        var finalBtn = $("#finalizar");
        var pauseBtn = $("#pausar");
        var endBtn = $("#endBtn");
        var pontuacao = $("#score");
        var pontosPalavra = $("#pontosPalavra");
        var imagemPalavra = $("#imagemPalavra");
        var numPalavras = $("#numPalavras");
        var numPontos = $("#numPontos");
        var mVitoria = $("#mVitoria");
        var mFala = $("#mFala");
        var mJogo = $("#wrapper");
        var mPontos = $("#mPontos");
        var textbox = $("#textbox");
        var skipBtn = $("#skipBtn");

        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.voice = voices[10];
        msg.voiceURI = 'native';
        msg.volume = 1;
        msg.rate = 0.7;
        msg.pitch = 2;
        msg.lang = 'pt-BR';

        recognition.continuous = false;
        recognition.lang = "pt-br";
        recognition.interimResults = false;

        let gamePaused = false;
        let gameInterval = null;
        var recognitionTimeout = null;
        var activeUser = document.getElementById('nomeUsuario').value;

        var imgFolder = null;
        var contPalavras = 0;
        var contTentativas = 0;
        var playBoard = document.getElementById("play-board");
        var ctx=playBoard.getContext("2d"); //renderização 2d no canvas

        let snakeBody =[
            {x: 150, y: 150},
            {x: 140, y: 150},
            {x: 130, y: 150},
            {x: 120, y: 150},
            {x: 110, y: 150},
        ];//coordenadas do corpo da cobra, que serão atualizadas depois
        
        let velX = 10, velY = 0;//velocidade inicial
        let foodX, foodY; //posição da comida
        let pontos=0;
        
        function changeFoodPosition (){

            foodX = Math.floor(Math.random() * (300 / 10)) * 10;
            foodY = Math.floor(Math.random() * (250/ 10)) * 10;
            console.log("Posição"+foodX,foodY);
        
            while (snakeBody.some(part => part.x === foodX && part.y === foodY)) {
                foodX = Math.floor(Math.random() * (300 / 10)) * 10;
                foodY = Math.floor(Math.random() * (250 / 10)) * 10;
            }//garante que a comida não estará dentro do corpo da cobra

        
        };
        //changeFoodPosition();
        function drawFood(){
            ctx.fillStyle = 'red';
            ctx.strokestyle = 'darkred';
            ctx.fillRect(foodX, foodY, 10, 10);
            ctx.strokeRect(foodX, foodY, 10, 10);
        }


        function startRecognition() {
            if (isRecognitionActive) {
                console.log("Reconhecimento já está ativo, não é possível iniciar novamente.");
                return;
            } else {
                console.log("Reconhecimento iniciado");
                recognition.start();
                recognitionTimeout = setTimeout(function() {
                    recognition.stop();
                    console.log("Nenhuma entrada de áudio detectada.");
                }, 10000);
            }
        }

        function pronunciaCerta() {
            console.log("Você acertou!");
            let pontosP = 0;
            switch (filaPalavras[0].vidas) {
                case 3:
                    pontosP = 100;
                    console.log("Vc ganhou 100 pontos!");
                    break;
                case 2:
                    pontosP = 50;
                    console.log("Vc ganhou 50 pontos!");
                    break;
                case 1:
                    pontosP = 30;
                    console.log("Vc ganhou 30 pontos!");
                    break;
                case 0:
                    pontosP = 10;
                    console.log("Vc ganhou 10 pontos!");
                    break;
            }
            pontos = pontos + pontosP;
            $.ajax({
                type: 'POST',
                url: 'conexaoAJAXpalavra.php',
                data: {
                    nome: activeUser,
                    palavra: filaPalavras[0].palavra,
                    dificuldade: dificuldadeValue,
                    tentativas: filaPalavras[0].tentativas
                },
                success: function(response) {
                    console.log("Data sent to the database successfully!");
                    console.log(response);
                },
                error: function(xhr, status, error) {
                    console.error("Error occurred while sending data to the database:", error);
                }
            });
            pontuacao.text("Pontos: " + pontos);
            snakeBody.push([foodX, foodY]); //aumenta a cobra
            changeFoodPosition();

            filaPalavras.splice(0, 1);
            console.log(filaPalavras);
            contPalavras++;
            contTentativas = contTentativas + filaPalavras[0].tentativas;
            
            mFala.css('display', 'none');
            pontosPalavra.text(pontosP);

            let color = updateLives();
            pontosPalavra.css('color', color);

            mPontos.css('display', 'flex');
            setTimeout(function() {
                mPontos.css('display', 'none');
                gamePaused=false;
                togglePause();
            }, 4000);

        }

        const drawSnake = () => {
            ctx.fillStyle = '#5B7BF9';  // Cor de preenchimento da cobra
            ctx.strokeStyle = 'black';  // Cor da borda da cobra
            snakeBody.forEach(part => {
                ctx.fillRect(part.x, part.y, 10, 10);    // Desenha um quadrado preenchido para cada parte da cobra
                ctx.strokeRect(part.x, part.y, 10, 10);  // Desenha a borda do quadrado para cada parte da cobra
            });
        }; //desenha cobra

        const advanceSnake = () => {
            const newHead = {
                x: snakeBody[0].x + velX,
                y: snakeBody[0].y + velY
            };//nova posição da cabeça
     
            snakeBody.unshift(newHead); //adiciona a nova cabeça/difreção no corpo da cobra

            if (newHead.x === foodX && newHead.y === foodY) {  // Se a cobra comer a comida
                falaPalavra();
                changeFoodPosition(); // Gera uma nova posição para a comida
            } else {
                snakeBody.pop(); // Remove o último segmento se não come
            }
        };

        const checkCollision = () => {
            const head = snakeBody[0];
          // Verifica se a cabeça atravessou as bordas e reaparece do lado oposto
        if (head.x > 290) head.x = 0;
        if (head.x < 0) head.x =300;
        if (head.y == (260)) head.y = 0;
        if (head.y < 0) head.y = 260;

            // Verifica colisão com o próprio corpo
            for (let i = 1; i < snakeBody.length; i++) {
                if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
                    vitoria();
                }
            }
        };
        
        $("#listenBtn").click(function(event) {
            event.preventDefault();
            recognition.stop();
            console.log("Botão de reprodução foi clicado");
            isRecognitionActive = false;
            filaPalavras[0].reproducoes++;
            falaPalavra();
        });

        finalBtn.click(function() {
            console.log("Botão Finalizar clicado");
            vitoria();
        });

        pauseBtn.click(function(){
            console.log("Botão pausar clicado");
            gamePaused =! gamePaused;
            if(gamePaused){
                clearInterval(gameInterval);
            }else{
                gameInterval = setInterval(updateCanvas, 100); // executa o update canvas
            }  
        })

        endBtn.click(function() {
            console.log("Botão Finalizar clicado");
            vitoria();
        });

        skipBtn.click(function() {
            console.log("Botão Pular clicado");
            filaPalavras.push(filaPalavras.shift());
            falaPalavra();
        });

        function ordenaPalavras(filaPalavras) {
            let listaAuxiliar = [];

            for (let i = 0; i < filaPalavras.length; i++) {
                let objetoPalavra = {
                    palavra: filaPalavras[i],
                    vidas: 3,
                    tentativas: 1,
                    reproducoes: 0,
                    imgi: i
                };
                listaAuxiliar.push(objetoPalavra);
                filaPalavras[i] = objetoPalavra;
            }

            listaAuxiliar.sort(() => Math.random() - 0.5);
            filaPalavras = listaAuxiliar;
            console.log(filaPalavras);
            return filaPalavras;
        }

        function falaPalavra() {
            gamePaused=true;
            togglePause();
            var palavra = filaPalavras[0].palavra;
            var indice = filaPalavras[0].imgi;
            var imgSrc = "imagens/" + imgFolder + "/" + indice + ".jpg";

            updateLives();
            console.log("Fonte da imagem " + imgSrc);
            console.log("Fale: " + palavra);

            document.getElementById("palavra").textContent = palavra.toUpperCase();
            document.getElementById("imagemPalavra").src = imgSrc;
            msg.text = "Fale " + palavra;
            speechSynthesis.speak(msg);
            startRecognition();
        }

        recognition.onstart = function() {
            console.log("Reconhecimento por voz iniciado");
            isRecognitionActive = true;
            clearTimeout(recognitionTimeout);
        };

        recognition.onend = function() {
            console.log("Fim do reconhecimento");
            isRecognitionActive = false;
            clearTimeout(recognitionTimeout);
        };

        recognition.onerror = function(event) {
            console.log("Error: " + event.error);
            if (event.message) {
                console.log("Error Details: " + event.message);
            }
        };

        recognition.onresult = function(event) {
            console.log("Processando resultados...");
            var resultado = event.resultIndex;
            var transcript = event.results[resultado][0].transcript;
            var palavras = transcript.toLowerCase();
            palavras = palavras.replace(/\./g, '');
            palavras = palavras.split(' ');

            console.log(palavras);

            if (event.results[resultado].isFinal) {
                console.log("Palavra falada: " + textbox.val());
                console.log("Palavra na filaPalavras: " + filaPalavras[0].palavra);
                if (palavras[0] == filaPalavras[0].palavra) {
                    pronunciaCerta();
                } else {
                    pronunciaErrada();
                }
            }
        };

        function pronunciaErrada() {
            if (filaPalavras[0].vidas > 0) {
                filaPalavras[0].vidas--;
                filaPalavras[0].tentativas++;
                updateLives();
                console.log("Tente novamente! Você tem " + filaPalavras[0].vidas + " Tentativas restantes");
            } else {
                console.log("Você não tem mais vidas, Vamos continuar!");
                filaPalavras.push(filaPalavras.shift());
                console.log(filaPalavras);
                gamePaused = false;
                togglePause();
            }
        }

        function vitoria() {
            clearInterval(gameInterval);
            gameInterval = null;

            mJogo.css('display', 'none');
            mFala.css('display', 'none');
            mVitoria.css('display', 'flex');
            imagemPalavra.css('display', 'none');

            console.log("Palavras:" + contPalavras);
            console.log("Pontos:" + pontos);

            numPalavras.text(contPalavras);
            numPontos.text(pontos);

            $.ajax({
                type: 'POST',
                url: 'conexaoAJAXresultado.php',
                data: {
                    nome: activeUser,
                    palavras: contPalavras,
                    tentativas: contTentativas,
                    pontuacao: pontos
                },
                success: function(response) {
                    console.log("Data sent to the database successfully!");
                    console.log(response);
                },
                error: function(xhr, status, error) {
                    console.error("Error occurred while sending data to the database:", error);
                }
            });
        }

        function updateLives() {
            let color = '';
            switch (filaPalavras[0].vidas) {
                case 3:
                    color = "rgb(0, 184, 0)";
                    document.getElementById("L1").style = "color:" + color;
                    document.getElementById("L2").style = "color:" + color;
                    document.getElementById("L3").style = "color:" + color;
                    break;
                case 2:
                    color = "rgb(255, 230, 1)";
                    document.getElementById("L1").style = "color:" + color;
                    document.getElementById("L2").style = "color:" + color;
                    document.getElementById("L3").style = "color:rgb(255, 255, 255);";
                    break;
                case 1:
                    color = "rgb(255, 0, 0)";
                    document.getElementById("L1").style = "color:" + color;
                    document.getElementById("L2").style = "color:rgb(255, 255, 255);";
                    document.getElementById("L3").style = "color:rgb(255, 255, 255);";
                    break;
                default:
                    break;
            }
            return color;
        }

        const changeDirection = (event) => {
            const keyPressed = event.keyCode;
            const goingUp = velY === -10;
            const goingDown = velY === 10;
            const goingRight = velX === 10;
            const goingLeft = velX === -10;
    
            if (keyPressed === 37 && !goingRight) {
                velX = -10;
                velY = 0;
            } else if (keyPressed === 38 && !goingDown) {
                velX = 0;
                velY = -10;
            } else if (keyPressed === 39 && !goingLeft) {
                velX = 10;
                velY = 0;
            } else if (keyPressed === 40 && !goingUp) {
                velX = 0;
                velY = 10;
            }
        };

        const togglePause = () => {
            if (gamePaused) {
                console.log("Game Paused");
                clearInterval(gameInterval);
                //gameInterval = null;

                mJogo.css('display', 'none');
                mFala.css('display', 'flex');
                imagemPalavra.css('display', 'flex');
            } else {
                console.log("Game Resumed");
                mFala.css('display', 'none');
                imagemPalavra.css('display', 'none');
                mJogo.css('display', 'flex');
                initGame();
            }
        }

        const updateCanvas = () => {
            ctx.clearRect(0, 0, playBoard.width, playBoard.height); // Limpa o canvas
            drawFood();
            drawSnake();
            advanceSnake();
            checkCollision();
        };

        const initGame = () => {
           changeFoodPosition();//desenha a comida
           gameInterval = setInterval(updateCanvas, 100);
           document.addEventListener("keydown", changeDirection);
            drawSnake();
        }
        initGame();

        function getCookie(nome) {
            const cookies = document.cookie.split(';');

            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(nome + '=')) {
                    return cookie.substring(nome.length + 1);
                }
            }
            return null;
        }

        filaPalavras = JSON.parse(getCookie('filaPalavras'));
        imgFolder = getCookie('imgFolder');
        dificuldadeValue = getCookie('dificuldadeValue');
        if (dificuldadeValue) {
            dificuldadeValue = 1;
        } else {
            dificuldadeValue = 0;
        }

        console.log("Nome do usuário: " + activeUser);
        console.log("Dif: " + dificuldadeValue);
        console.log(filaPalavras);
        filaPalavras = ordenaPalavras(filaPalavras);
    });
});
