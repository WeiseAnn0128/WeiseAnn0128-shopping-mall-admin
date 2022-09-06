<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="接收者所属机构" prop="receiveDept">
        <el-input
          v-model="queryParams.receiveDept"
          placeholder="请输入接收者所属机构"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收人ID" prop="receiverId">
        <el-input
          v-model="queryParams.receiverId"
          placeholder="请输入接收人ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="接收人昵称" prop="receiverNickName">
        <el-input
          v-model="queryParams.receiverNickName"
          placeholder="请输入接收人昵称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话通知状态" prop="phoneCallState">
        <el-input
          v-model="queryParams.phoneCallState"
          placeholder="请输入电话通知状态"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话通知时长" prop="phoneCallDuration">
        <el-input
          v-model="queryParams.phoneCallDuration"
          placeholder="请输入电话通知时长"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="短信通知状态" prop="smsState">
        <el-input
          v-model="queryParams.smsState"
          placeholder="请输入短信通知状态"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['web:issue:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['web:issue:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['web:issue:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['web:issue:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="issueList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="警情下发id" align="center" prop="issueId" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="下发内容" align="center" prop="content" />
      <el-table-column label="接收者所属机构" align="center" prop="receiveDept" />
      <el-table-column label="接收人ID" align="center" prop="receiverId" />
      <el-table-column label="接收人昵称" align="center" prop="receiverNickName" />
      <el-table-column label="电话通知状态" align="center" prop="phoneCallState" />
      <el-table-column label="电话通知时长" align="center" prop="phoneCallDuration" />
      <el-table-column label="短信通知状态" align="center" prop="smsState" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['web:issue:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['web:issue:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改警情下发记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="下发内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="接收者所属机构" prop="receiveDept">
          <el-input v-model="form.receiveDept" placeholder="请输入接收者所属机构" />
        </el-form-item>
        <el-form-item label="接收人ID" prop="receiverId">
          <el-input v-model="form.receiverId" placeholder="请输入接收人ID" />
        </el-form-item>
        <el-form-item label="接收人昵称" prop="receiverNickName">
          <el-input v-model="form.receiverNickName" placeholder="请输入接收人昵称" />
        </el-form-item>
        <el-form-item label="电话通知状态" prop="phoneCallState">
          <el-input v-model="form.phoneCallState" placeholder="请输入电话通知状态" />
        </el-form-item>
        <el-form-item label="电话通知时长" prop="phoneCallDuration">
          <el-input v-model="form.phoneCallDuration" placeholder="请输入电话通知时长" />
        </el-form-item>
        <el-form-item label="短信通知状态" prop="smsState">
          <el-input v-model="form.smsState" placeholder="请输入短信通知状态" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listIssue, getIssue, delIssue, addIssue, updateIssue } from "@/api/web/issue";

export default {
  name: "Issue",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 警情下发记录表格数据
      issueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        receiveDept: null,
        receiverId: null,
        receiverNickName: null,
        phoneCallState: null,
        phoneCallDuration: null,
        smsState: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询警情下发记录列表 */
    getList() {
      this.loading = true;
      listIssue(this.queryParams).then(response => {
        this.issueList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        issueId: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        content: null,
        receiveDept: null,
        receiverId: null,
        receiverNickName: null,
        phoneCallState: null,
        phoneCallDuration: null,
        smsState: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.issueId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加警情下发记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const issueId = row.issueId || this.ids
      getIssue(issueId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改警情下发记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.issueId != null) {
            updateIssue(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addIssue(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const issueIds = row.issueId || this.ids;
      this.$modal.confirm('是否确认删除警情下发记录编号为"' + issueIds + '"的数据项？').then(function() {
        return delIssue(issueIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('web/issue/export', {
        ...this.queryParams
      }, `issue_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
