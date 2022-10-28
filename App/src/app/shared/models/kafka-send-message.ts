import { KafkaKeyValue } from "./kafka-key-value";

export interface KafkaSendMessage {
  records: KafkaKeyValue[]
}