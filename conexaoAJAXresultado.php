<?php
require_once 'conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Recupera dados do POST
$nome = $_POST['nome'] ?? '';
$palavras = $_POST['palavras'] ?? '';
$tentativas = $_POST['tentativas'] ?? '';
$pontuacao = $_POST['pontuacao'] ?? '';

try {
    // Prepara a consulta
    $query = "INSERT INTO ssscores (nome, palavras, tentativas, pontuacao) VALUES (?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);
    
    // Vincula os parâmetros
    // 'sssi' significa: string, string, string, integer
    $stmt->bind_param('sssi', $nome, $palavras, $tentativas, $pontuacao);
    
    // Executa a declaração
    $stmt->execute();
    
    // Retorna sucesso
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Dados inseridos com sucesso no banco de resultados!'
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