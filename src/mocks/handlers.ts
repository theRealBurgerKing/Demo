// src/mocks/handlers.ts
import { rest } from 'msw'

let taskStatus: Record<string, { status: string, start: number }> = {}

export const handlers = [
  // start task
  rest.post('https://d12qavyo5a8mvc.cloudfront.net/api/start_work', async (req, res, ctx) => {
    console.log('MSW: intercept start_work request')
    
    const task_id = 'mock-' + Math.random().toString(36).slice(2)
    taskStatus[task_id] = { status: 'running', start: Date.now() }
    
    return res(
      ctx.delay(1000), // simulate network delay
      ctx.status(200),
      ctx.json({ 
        status: 'running', 
        task_id 
      })
    )
  }),

  // poll task result
  rest.get('https://d12qavyo5a8mvc.cloudfront.net/taskresult/:task_id', (req, res, ctx) => {
    console.log('MSW: intercept taskresult request')
    
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
    
    // simulate processing time: 3-5 seconds
    const elapsed = (Date.now() - info.start) / 1000
    console.log(`Task ${task_id} has run for ${elapsed.toFixed(1)} seconds`)
    
    // mark as finished after 5 seconds
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
    
    // timeout after 90 seconds
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