<?php

include('conexao.php');

if(isset($_POST['name'])&& isset($_POST['email']) && isset($_POST['password'])){

    $nome = trim($_POST['name']); // Remover espaços em branco no início e no final
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if(empty($nome)||empty ($password)){
        echo "<script>alert('Por favor, insira ao menos um nome válido e uma senha');</script>";
    } else {
        $nome = $mysqli->real_escape_string($nome); 
        $email = $mysqli->real_escape_string($email);
        $password = $mysqli->real_escape_string($password);
        //proteção de sql injection

        // Verifica se o nome já existe no banco de dados
        //$sql_code = "SELECT * FROM ssusers WHERE nome ='$nome'";
        //$sql_query = $mysqli->query($sql_code) or die("Falha na execução do código:" .$mysqli->error );

        //para fazer o registro não deve haver um existente
        //$quantidade = $sql_query->num_rows;

        

            $sql_code= "INSERT INTO ssusers (name,email,password) VALUES (?,?,?)";
            $stmt = $mysqli->prepare($sql_code);
            if ($stmt === false) {
                die("Erro na preparação da consulta: " . $mysqli->error);
            }
            $stmt->bind_param("sss", $nome, $email,$password);
            
            if($stmt->execute()){
               echo "<script>alert('Usuário cadastrado!');</script>";
               echo "<script>window.location.href='index.php';</script>";
            }else{
                echo "<script>alert('Erro ao cadastrar usuário: " . $stmt->error . "');</script>";
            }

        }
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

    <div class="mEscuro" id="mEscuro">
        <div class="mRegister" id="mRegister">
            <a href="https://ibb.co/S6m2MVZ">
                <img src="https://i.ibb.co/hgdk42T/Design-sem-nome-1.png" alt="Design-sem-nome-1" width="250" height="250">
            </a>
            <form method="post" name="loginForm" id="loginForm">
                <h3>Cadastro</h3>
                <input type="text" name="name" placeholder="Nome">
                <input type="text" name="email" placeholder="Email (opcional)">
                <input type="text" name="password" placeholder="Senha"> 
                <button type="submit"class="registerBtn" id="registerBtn">Cadastrar</button>
                <br>
            </form>
            <button class="returnBtn" id="returnBtn" onclick="logout()">Voltar</button> 
        </div>
    </div>
</body>
<script>
    function logout() {
            // Redirecionar para a página de logout
            window.location.href = "logout.php";
        }
</script>
</html>
