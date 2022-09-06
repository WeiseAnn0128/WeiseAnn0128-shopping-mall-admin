import request from '@/utils/request'

export function issue(firefighterIds, alarmId) {
  return request({
    url: '/web/alarm/issue/' + firefighterIds + '/' + alarmId,
    method: 'get',
  })
}

// 查询警情下发记录列表
export function listIssue(query) {
  return request({
    url: '/web/issue/list',
    method: 'get',
    params: query
  })
}

// 查询警情下发记录详细
export function getIssue(issueId) {
  return request({
    url: '/web/issue/' + issueId,
    method: 'get'
  })
}

// 新增警情下发记录
export function addIssue(data) {
  return request({
    url: '/web/issue',
    method: 'post',
    data: data
  })
}

// 修改警情下发记录
export function updateIssue(data) {
  return request({
    url: '/web/issue',
    method: 'put',
    data: data
  })
}

// 删除警情下发记录
export function delIssue(issueId) {
  return request({
    url: '/web/issue/' + issueId,
    method: 'delete'
  })
}
