import { ElMessage } from 'element-plus'
export class NotificationService {
    static showMessage = (msg:string) => {
        ElMessage(msg)
    }
}