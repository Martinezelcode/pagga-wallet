# API Reference

## Models

### Token
```json
{
  "chainId": "string",
  "contractAddress": "string",
  "name": "string",
  "symbol": "string",
  "decimals": "number",
  "balance": "string",
  "balanceRawInteger": "string",
  "balanceUsd": "string"
}
```

### Transaction
```json
{
  "hash": "string",
  "from": "string",
  "to": "string",
  "value": "string",
  "gasPrice": "string",
  "gasUsed": "string",
  "blockTimestamp": "string",
  "blockNumber": "string"
}
```

## Endpoints

### GET wallet/token_list

Получение списка токенов для конкретного кошелька и сети.

**Parameters:**
- `id` (required): адрес кошелька пользователя
- `chain_id` (required): идентификатор сети (например, 1 для Ethereum mainnet, 11155111 для Sepolia testnet)

**Response:**
```json
{
  "tokens": [Token]
}
```

### GET wallet/all_token_list

Получение списка токенов для конкретного кошелька по всем или указанным сетям.

**Parameters:**
- `id` (required): адрес кошелька пользователя
- `chain_ids` (optional): список идентификаторов сетей (например, [1, 11155111])

**Response:**
```json
{
  "tokens": {
    "chainId": [Token]
  }
}
```

### GET wallet/history_list

Получение истории транзакций для конкретного кошелька и сети.

**Parameters:**
- `id` (required): адрес кошелька пользователя
- `chain_id` (required): идентификатор сети (например, 1 для Ethereum mainnet, 11155111 для Sepolia testnet)

**Response:**
```json
{
  "transactions": [Transaction]
}
```

### GET wallet/all_history_list

Получение истории транзакций для конкретного кошелька по всем или указанным сетям.

**Parameters:**
- `id` (required): адрес кошелька пользователя
- `chain_ids` (optional): список идентификаторов сетей (например, [1, 11155111])

**Response:**
```json
{
  "transactions": {
    "chainId": [Transaction]
  }
}
```
