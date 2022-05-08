const queue: any[] = []

let isFlushPending = false

const p = Promise.resolve()

// 用户可以使用 nextTick 执行视图更新之后的逻辑
export function nextTick(fn) {
    return fn ? p.then(fn) : p
}

export function queueJobs(job) {
    // 如果队列中没有 job 时，才将 job 加入到队列
    if (!queue.includes(job)) {
        queue.push(job)
    }

    queueFlush()
}

function queueFlush() {
    // 避免生成多个 Promise
    if (isFlushPending) return
    isFlushPending = true

    nextTick(flushJobs)
}

// 在微任务中执行 视图更新
function flushJobs() {
    isFlushPending = false

    let job
    while (job = queue.shift()) {
        job && job()
    }
}