<?php
// Assuming you have a file for database connection named 'db_connection.php'
require_once 'conexao.php';

// Retrieving data from POST request
$nome = $_POST['nome'] ?? '';
$palavra = $_POST['palavra'] ?? '';
$dificuldade = $_POST['dificuldade'] ?? '';
$tentativas = $_POST['tentativas'] ?? '';

try {
    // Prepara a consulta
    $query = "INSERT INTO ssinfos (nome, palavra, dificuldade, tentativas) VALUES (?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);
    
    // Vincula os parâmetros
    // 'sssi' significa: string, string, string, integer
    $stmt->bind_param('sssi', $nome, $palavra, $dificuldade, $tentativas);
    
    // Executa a declaração SEM parâmetros
    $stmt->execute();
    
    // Retorna sucesso
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Dados inseridos com sucesso!'
    ]);
    
} catch (Exception $e) {
    // Retorna erro
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro ao inserir dados',
        'detalhes' => $e->getMessage()
    ]);
} finally {
    // Fecha a declaração
    if (isset($stmt)) {
        $stmt->close();
    }
}
?>