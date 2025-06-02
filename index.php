<?php
include('conexao.php'); // Conexão com o banco de dados

if (isset($_POST['name'])) {
    // Verifica se o campo "nome" foi preenchido
    if (strlen($_POST['name']) == 0) {
        echo "<script>alert('Digite seu nome');</script>";
    } else {
        // Protege contra SQL Injection
        $name = $mysqli->real_escape_string($_POST['name']);

        // Busca o usuário pelo nome
        $sql_code  = "SELECT * FROM ssusers WHERE name='$name'";
        $sql_query = $mysqli->query($sql_code) or die("Falha na execução do código: " . $mysqli->error);

        $quantidade = $sql_query->num_rows; // Número de linhas retornadas

        if ($quantidade == 0) {
            // Usuário não encontrado
            echo "<script>alert('Usuário não encontrado');</script>";
        } elseif ($quantidade == 1) {
            // Usuário encontrado, extrai os dados
            $usuario = $sql_query->fetch_assoc();

            // Verifica se a senha foi enviada
            if (isset($_POST['password']) && !empty($_POST['password'])) {
                // Compara a senha enviada com o hash armazenado
                if (($_POST['password']=== $usuario['password'])) {
                    // Se a sessão não estiver iniciada, inicia
                    if (!isset($_SESSION)) {
                        session_start();
                    }

                    // Grava os dados do usuário na sessão
                    $_SESSION['ID']   = $usuario['ID'];
                    $_SESSION['name'] = $usuario['name'];

                    // Redireciona para a página de seleção
                    header("Location: selecao.php");
                    exit;
                } else {
                    // Senha incorreta
                    echo "<script>alert('Senha incorreta');</script>";
                }
            } else {
                // Campo de senha vazio
                echo "<script>alert('Digite sua senha');</script>";
            }
        } else {
            // Mais de um usuário com o mesmo nome (erro inesperado)
            echo "<script>alert('Falha no login');</script>";
        }
    }
} else {
    // Caso o formulário não tenha sido submetido corretamente
    echo "<script>alert('Falha ao logar');</script>";
}
?>

<!DOCTYPE html>
<html lang="pt" dir="auto">
<head>
    <meta charset="utf-8">
    <title>SpeakSnake</title>
    <link rel="icon" href="miniLogo.png" type="image/png">
    <link rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</head>
<body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

    <div class="mLogin" id="mLogin">
        <img src="imagens/spk2logo.png" alt="Logo SpeakSnake" width="300" height="300">
        <form method="post" name="loginForm" id="loginForm">
            <h3>Bem-vindo!</h3>
            <input type="text" name="name" placeholder="Nome">
            <input type="password" name="password" placeholder="Senha">
            <button type="submit" class="Login" id="Login">Entrar</button>
            <br>
        </form>
        <button class="registerBtn" id="registerBtn" onclick="redirectToRegister()">Cadastrar</button>
    </div>
</body>
<script>
    function redirectToSelectionPage() {
        window.location.href = "selecao.php";
    }

    function redirectToRegister() {
        window.location.href = "register.php";
    }
</script>
</html>
+
