// src/mocks/handlers.ts
import { rest } from 'msw'

let taskStatus: Record<string, { status: string, start: number }> = {}

export const handlers = [
  // 启动任务
  rest.post('https://d12qavyo5a8mvc.cloudfront.net/api/start_work', async (req, res, ctx) => {
    console.log('🎯 MSW: 拦截到 start_work 请求')
    
    const task_id = 'mock-' + Math.random().toString(36).slice(2)
    taskStatus[task_id] = { status: 'running', start: Date.now() }
    
    return res(
      ctx.delay(1000), // 模拟网络延迟
      ctx.status(200),
      ctx.json({ 
        status: 'running', 
        task_id 
      })
    )
  }),

  // 轮询任务结果
  rest.get('https://d12qavyo5a8mvc.cloudfront.net/taskresult/:task_id', (req, res, ctx) => {
    console.log('🔄 MSW: 拦截到 taskresult 请求')
    
    const { task_id } = req.params
    const info = taskStatus[task_id as string]
    
    if (!info) {
      return res(
        ctx.status(400),
        ctx.json({ 
          Code: 'BadRequestError', 
          Message: 'task not found' 
        })
      )
    }
    
    // 模拟处理时间：3-5秒完成
    const elapsed = (Date.now() - info.start) / 1000
    console.log(`⏱️ 任务 ${task_id} 已运行 ${elapsed.toFixed(1)} 秒`)
    
    // 5秒后标记为完成
    if (elapsed > 5) {
      taskStatus[task_id as string].status = 'finished'
      return res(
        ctx.status(200),
        ctx.json({
          status: 'finished',
          result_image_path: '/public/generatedpic.jpg'
        })
      )
    }
    
    // 90秒后超时
    if (elapsed > 90) {
      taskStatus[task_id as string].status = 'error'
      return res(
        ctx.status(200),
        ctx.json({ status: 'error' })
      )
    }
    
    return res(
      ctx.status(200),
      ctx.json({ status: 'running' })
    )
  }),
]