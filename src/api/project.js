import service from 'common/js/fetch'

// 获取项目估值列表
export function getProjectValuation(projectName = undefined) {
    const data = {
        projectName: projectName
    }
    return service({url: '/appraisement/likeAppraisement', method: 'post', data})
}

// 根据状态估值查询
export function getProjectBySelect(selectValue) {
	const data = {
        appraisementStatus: selectValue	// 1:已提交2：未提交 （为null时查询提交及提交的s所有）
    }
    return service({url: '/appraisement/selectAppraisement', method: 'post', data})
}

// 修改估值
export function updateValuation(params = {}) {
	let { appraisementValue, appraisementStatus, projectId, appraisementParamer, id, appraisementUserId } = params;
	const data = {
		appraisementValue, //估值金额: HHHHH,
		appraisementStatus, //1:已提交2：未提交: 
		projectId, //项目ID: dc3e4b66ed5944ec9fa10e83aa0c3301,
		appraisementParamer, //项目估值参数: 1,
		id, //估值ID: 2,
		appraisementUserId //估值人员: 1
	}
	return service({url: '/appraisement/updaAppraisement', method: 'post', data})
}

// 项目池列表
export function getPros(params = {}) {
	let { projectName, projectType, industryId, merchantId } = params;
	const data = {
		projectName, // 项目名关键字:"讲",
		projectType, // 状态ID(1：正常 2：观察 3中止 4：淘汰)"1",
		industryId,  // 数据字典中行业ID:"14","
		merchantId   // 商业ID（必传）:"123456"
	}
	return service({url: '/projectPool/searchProject', method: 'post', data})
}

// 项目池详情
export function getProDetail(id) {
	const data = {
		id
	}
	return service({url: '/projectPool/selectProjectPool', method: 'post', data});
}

// 添加项目池
export function addPro(params = {}) {
	let { projectInfo, enterpriseInfo, merchantId } = params;
	/*
	let { 
		projectName, //项目名: "2",
        projectShortName, //项目简称: "3",
        addressId, //项目所在地: "321",
        createPersonId, //项目创建人: "ooo",
        projectTypeId, //项目类型ID: null,
        industryId, //行业ID: null,
        projectFromId, //项目来源: null,
        departmentId //业务部门ID: null
    } = ( projectInfo || {} )
    let {
    	"page": 1,
        "pageSize": 10,
        "projectId"//基本信息ID: "1",
        "enterpriseName"//企业名称: "5555",
        "legalPerson"//法人: "CESHI",
        "registeredCapital"注册资本: null,
        "paiclCapital"//实收资本: null,
        "registerDate"//注册登记时间 : null,
        "creditCode"//统一信用代码: null,
        "registerAddress"//注册地址: null,
        "workAddress"//办公地址: null,
        "mainBusiness"//主营业务: null,
        "remark"//备注: null
    } = ( enterpriseInfo || {} )
	*/
	const data = {
		merchantId,
		projectInfo,
		enterpriseInfo
	}
	return service({url: '/projectPool/addProjectPool', method: 'post', data})
}

// 删除项目
export function delPro(id, projectType) {
	const data = {
		id,
		projectType
	} 
	return service({url: '/projectPool/deleteProject', method: 'post', data});
}

// 转投资
export function transPro(params = {}) {
	let { projectId, merchantId, addProjectUserId } = params;
	const data = {
		projectId,
		merchantId,
		addProjectUserId
	}
	return service({url: '/investProject/addInvestProject', method: 'post', data});
}


////// 项目池记录 ////
// 获取记录列表
export function getRecords(projectId, recordStatus) {
	const data = {
		projectId,   //项目ID
		recordStatus,  // 记录状态：1：正常 2：删除
	}
	return service({url: '/operatingRecord/selectOperatingRecord', method: 'post', data});
}

// 添加记录
export function addRecord(params = {}) {
	let { projectId, merchantId, seedUserId, seedInfo, recordType } = params;
	const data = {
		projectId,   //项目ID
		seedUserId,  //用户ID
		seedInfo,    //  提交记录内容
		merchantId,  // 商户ID
		recordType     //记录类型
	}
	console.log('addRecord: ', data);
	return service({url: '/operatingRecord/addOperatingRecord', method: 'post', data});
}

// 删除记录
export function delRecord(id, recordStatus) {
	const data = {
		id,   //项目ID
		recordStatus,  // 记录状态：1：正常 2：删除
	}
	return service({url: '/operatingRecord/deleteOperatingRecord', method: 'post', data});
}
