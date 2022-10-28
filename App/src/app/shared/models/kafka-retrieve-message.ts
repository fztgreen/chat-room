import { SendMessage } from "./send-message";

export interface KafkaRetrieveMessage {
    // {"key":null,"value":{"foo":"bar"},"partition":0,"offset":0,"topic":"jsontest"}
    key: string,
    value: SendMessage,
    partition: number,
    offset: number
    topic: string
}
