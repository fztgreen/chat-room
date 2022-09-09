import { KafkaKeyValue } from "./kafka-key-value";

export interface KafkaRetrieveMessage {
    // {"key":null,"value":{"foo":"bar"},"partition":0,"offset":0,"topic":"jsontest"}
    key: string,
    value: KafkaKeyValue,
    partition: number,
    offset: number
    topic: string
}
