export interface KafkaCreateConsumerRequest
{
    name: string,
    format: string,
    "auto.offset.reset": string
}