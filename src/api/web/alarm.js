import request from '@/utils/request'

// 查询警情列表
export function listAlarm(query) {
  return request({
    url: '/web/alarm/list',
    method: 'get',
    params: query
  })
}

// 查询警情详细
export function getAlarm(alarmId) {
  return request({
    url: '/web/alarm/' + alarmId,
    method: 'get'
  })
}

// 新增警情
export function addAlarm(data) {
  return request({
    url: '/web/alarm',
    method: 'post',
    data: data
  })
}

// 修改警情
export function updateAlarm(data) {
  return request({
    url: '/web/alarm',
    method: 'put',
    data: data
  })
}

// 删除警情
export function delAlarm(alarmId) {
  return request({
    url: '/web/alarm/' + alarmId,
    method: 'delete'
  })
}
