<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="报警时间" prop="alarmTime">
        <el-date-picker clearable
          v-model="queryParams.alarmTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择报警时间">
        </el-date-picker>
      </el-form-item>
      <!-- <el-form-item label="报警地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入报警地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="报警人" prop="reporter">
        <el-input
          v-model="queryParams.reporter"
          placeholder="请输入报警人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="报警电话" prop="reporterPhoneNumber">
        <el-input
          v-model="queryParams.reporterPhoneNumber"
          placeholder="请输入报警人电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="警情类型" prop="alarmType">
        <el-select v-model="queryParams.alarmType" placeholder="请选择警情类型" clearable>
          <el-option
            v-for="dict in dict.type.zxy_alarm_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="警情等级" prop="alarmLevel">
        <el-select v-model="queryParams.alarmLevel" placeholder="请选择警情等级" clearable>
          <el-option
            v-for="dict in dict.type.zxy_alarm_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['web:alarm:add']"
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
          v-hasPermi="['web:alarm:edit']"
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
          v-hasPermi="['web:alarm:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['web:alarm:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="alarmList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="警情id" align="center" prop="alarmId" />
      <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
      <el-table-column label="报警时间" align="center" prop="alarmTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.alarmTime, '{y}-{m}-{d} {h}:{m}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="警情类型" align="center" prop="alarmType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.zxy_alarm_type" :value="scope.row.alarmType"/>
        </template>
      </el-table-column>
      <el-table-column label="警情等级" align="center" prop="alarmLevel">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.zxy_alarm_level" :value="scope.row.alarmLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="报警地址" align="center" prop="address" />
      <el-table-column label="报警人" align="center" prop="reporter" />
      <el-table-column label="报警人电话" align="center" prop="reporterPhoneNumber" />
      <el-table-column label="警情描述" align="center" prop="alarmDesc" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-phone-outline" @click="handleIssue(scope.row)" v-hasPermi="['web:alarm:issue']">下发</el-button>
          <el-button size="mini" type="text" icon="el-icon-document" @click="handleIssueList(scope.row)" v-hasPermi="['web:issue:list']">下发记录</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['web:alarm:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['web:alarm:remove']">删除</el-button>
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

    <!-- 警情下发对话框 -->
    <el-dialog :title="title" :visible.sync="issueOpen" width="800px" append-to-body>
      <el-form ref="issueForm" :model="issueForm" :rules="issueRules" label-width="80px">
        <el-form-item label="下发内容" prop="content">
          <el-input v-model="issueForm.content" type="textarea" placeholder="请输入内容" disabled />
        </el-form-item>
        <el-form-item label="接收组织" prop="issueOrgs">
          <treeselect v-model="issueForm.issueOrgs" :options="deptOptions" :show-count="true" :multiple="true"
            placeholder="请选择接收组织" :allowSelectingDisabledDescendants="false"/>
        </el-form-item>
        <el-form-item label="接收人">
          <el-select v-model="issueForm.firefighterIds" multiple placeholder="消防负责人" style="width: 100%;">
            <el-option v-for="item in issueForm.firefighters" :key="item.userId" :label="item.nickName" :value="item.userId"
              :disabled="item.status == 1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="issueSubmitForm">确 定</el-button>
        <el-button @click="issueCancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 警情下发记录对话框 -->
    <el-dialog :title="title" :visible.sync="issueListOpen" width="1000px" append-to-body>
      <el-form ref="issueListForm" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="报警时间" prop="alarmTime">
              <el-date-picker clearable v-model="form.alarmTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择报警时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入报警地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="报警人" prop="reporter">
              <el-input v-model="form.reporter" placeholder="请输入报警人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报警电话" prop="reporterPhoneNumber">
              <el-input v-model="form.reporterPhoneNumber" placeholder="请输入报警人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="警情类型" prop="alarmType">
              <el-select v-model="form.alarmType" placeholder="请选择警情类型">
                <el-option v-for="dict in dict.type.zxy_alarm_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="警情等级" prop="alarmLevel">
              <el-select v-model="form.alarmLevel" placeholder="请选择警情等级">
                <el-option v-for="dict in dict.type.zxy_alarm_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
          </el-col>
          <el-col :span="12">
          </el-col>
        </el-row> -->
        <el-form-item label="警情描述" prop="alarmDesc">
          <el-input v-model="form.alarmDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-table :data="issueList">
          <el-table-column label="接收组织" align="center" prop="receiveDept" />
          <el-table-column label="接收人" align="center" prop="receiverNickName" />
          <el-table-column label="下发时间" align="center" prop="createTime" />
          <el-table-column label="时长" align="center" prop="phoneCallDuration" />
          <el-table-column label="状态" align="center" prop="phoneCallStateDesc" />
          <el-table-column label="短信状态" align="center" prop="smsState" />
        </el-table>
        <pagination
          v-show="totalIssueList>0"
          :total="totalIssueList"
          :page.sync="queryParamsIssueList.pageNum"
          :limit.sync="queryParamsIssueList.pageSize"
          @pagination="getListIssueList"
        />
      </el-form>
      <!-- <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="issueSubmitForm">确 定</el-button>
        <el-button @click="issueCancel">取 消</el-button>
      </div> -->
    </el-dialog>

    <!-- 添加或修改警情对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
        <el-form-item label="报警时间" prop="alarmTime">
          <el-date-picker clearable v-model="form.alarmTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择报警时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="报警地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入报警地址" />
        </el-form-item>
        <el-form-item label="报警人" prop="reporter">
          <el-input v-model="form.reporter" placeholder="请输入报警人" />
        </el-form-item>
        <el-form-item label="报警电话" prop="reporterPhoneNumber">
          <el-input v-model="form.reporterPhoneNumber" placeholder="请输入报警人电话" />
        </el-form-item>
        <el-form-item label="警情类型" prop="alarmType">
          <el-select v-model="form.alarmType" placeholder="请选择警情类型">
            <el-option v-for="dict in dict.type.zxy_alarm_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="警情等级" prop="alarmLevel">
          <el-select v-model="form.alarmLevel" placeholder="请选择警情等级">
            <el-option v-for="dict in dict.type.zxy_alarm_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="警情描述" prop="alarmDesc">
          <el-input v-model="form.alarmDesc" type="textarea" placeholder="请输入内容" />
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
import { listAlarm, getAlarm, delAlarm, addAlarm, updateAlarm } from "@/api/web/alarm";
import { listUser, deptTreeSelect, listFireFighterByOrgs } from "@/api/system/user1";
import { listIssue, issue } from "@/api/web/issue";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Alarm",
  dicts: ['zxy_alarm_type', 'zxy_alarm_level'],
  components: { Treeselect },
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
      totalIssueList: 0,
      // 警情表格数据
      alarmList: [],
      issueList: [],
      // 弹出层标题
      title: "",
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      issueOpen: false,
      issueListOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        alarmTime: null,
        address: null,
        reporter: null,
        reporterPhoneNumber: null,
        alarmType: null,
        alarmLevel: null,
        alarmDesc: null
      },
      queryParamsIssueList: {
        pageNum: 1,
        pageSize: 10,
        alarmId: null
      },
      // 表单参数
      form: {},
      issueForm: {},
      // 表单校验
      rules: {},
      issueRules: {
        issueOrgs: [
          { required: true, message: "接收组织不能为空", trigger: "blur" },
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDeptTree();
  },
  watch: {
    'issueForm.issueOrgs'(newVal, oldVal) {
      // if deselect all child nodes of treeselect, the users belong to the top node will leave there incorrectly
      // clear the selection manually
      if (newVal.length == 0) {
        this.issueForm.firefighterIds.length = 0;
        this.issueForm.firefighters.length = 0;
      } else {
        listFireFighterByOrgs(newVal).then(response => {
            this.issueForm.firefighters = response.rows
            this.issueForm.firefighterIds = response.rows.map(e => e.userId);
          });
      }
    }
  },
  methods: {
    issueSubmitForm() {
      if (this.issueForm.firefighterIds.length == 0) {
        this.$message({
          message: '接收人不能为空',
          type: 'warning'
        });
        return;
      }
      this.$refs["issueForm"].validate(valid => {
        if (valid) {
          issue(this.issueForm.firefighterIds, this.issueForm.alarmId)
        }
      });
    },
    handleIssue(row) {
      this.reset();
      this.title = "警情下发";
      this.issueOpen = true;
      this.issueForm.alarmId = row.alarmId
      this.issueForm.content = row.alarmTime.substring(0, 16) + "，" + row.address + "，有"
                              + this.dict.type.zxy_alarm_level.filter(e => e.value == row.alarmLevel)[0].label
                              + this.dict.type.zxy_alarm_type.filter(e => e.value == row.alarmType)[0].label
                              + "，请及时处理；联系人及联系方式：" + row.reporter + " " + row.reporterPhoneNumber
                              + "；现场情况是：" + row.alarmDesc + "。"
    },
    getListIssueList(alarmId) {
      listIssue(this.queryParamsIssueList).then(response => {
        this.issueList = response.rows;
        this.totalIssueList = response.total;
      });
    },
    /** 查询警情列表 */
    getList() {
      this.loading = true;
      listAlarm(this.queryParams).then(response => {
        this.alarmList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleIssueList(row) {
      this.reset();
      const alarmId = row.alarmId || this.ids
      getAlarm(alarmId).then(response => {
        this.form = response.data;
        this.issueListOpen = true;
        this.title = "警情下发记录";
      });
      this.queryParamsIssueList.alarmId = alarmId;
      this.getListIssueList(alarmId);
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const alarmId = row.alarmId || this.ids
      getAlarm(alarmId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改警情";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.alarmId != null) {
            updateAlarm(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAlarm(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 查询警情列表 */
    getList() {
      this.loading = true;
      listAlarm(this.queryParams).then(response => {
        this.alarmList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    issueCancel() {
      this.issueOpen = false;
    },
    // 表单重置
    reset() {
      this.issueForm = {
        firefighters: [],
        firefighterIds: [],
        issueOrgs: [],
        alarmId: null
      },
      this.form = {
        alarmId: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        alarmTime: null,
        address: null,
        reporter: null,
        reporterPhoneNumber: null,
        alarmType: null,
        alarmLevel: null,
        alarmDesc: null
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
      this.ids = selection.map(item => item.alarmId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加警情";
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const alarmIds = row.alarmId || this.ids;
      this.$modal.confirm('是否确认删除警情编号为"' + alarmIds + '"的数据项？').then(function() {
        return delAlarm(alarmIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('web/alarm/export', {
        ...this.queryParams
      }, `alarm_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
