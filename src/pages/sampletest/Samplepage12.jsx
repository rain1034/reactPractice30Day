import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./SamplePage12.css";
import axios from "axios";

function TreeTable() {
  const [expandedRows, setExpandedRows] = useState({});
  const [filteredData, setFilteredData] = useState({
    empList: [],
    totalcnt: 0,
    /*
    pagenumcnt: 0,
    emp_no: "",
    emp_name: "",
    dept_cd: "",
    dept_name : "",
    reg_date : ""
    */
  }); // 검색조건
  const [filters, setFilters] = useState({
    search: "",
    type: "All",
    dType: "All",
    date: "",
  });

  //부서 대분류코드
  const [searchType, setSearchType] = useState({
    deptList : []
  });
  //부서 상세분류코드
  const [searchDType, setSearchDType] = useState({
    deptList : []
  });

  //테이블부서 대분류코드
  const [searchTableType, setSearchTableType] = useState({
    deptList : []
  });
  //테이블부서 상세분류코드
  const [searchTableDType, setSearchTableDType] = useState({
    deptList : []
  });

  //row readOnly
  const [readOnlyYn, setReadOnlyYn] = useState({});
  
  useEffect(() => {
    //조회조건
    searchTypeList('','1','top');
  },[],[searchTableDType]);

  //수정시 사용할 변수
  const [modifyEmpValue, setModifyEmpValue] = useState({
    deptCd: "",
    deptNm: "All",
  });

  //공통코드 조회 *공통코드 테이블 사용하지않고 내가만든거 쓰느라 그지같은 분기로 만듬
  const searchTypeList = useCallback((typeCode, lv, loc) => {
    let params = new URLSearchParams();
    //params.append("emp_name", filters.search);
    params.append("pagesize", 100);
    params.append("cpage", 1);
    params.append("groupcode", 'dept');
    params.append("searchFlag", 'Y');
    params.append("d_temp_field1", lv);
    params.append("d_temp_field2", typeCode);
    axios
      .post("/system/listdetailcode", params)
      .then((res) => {
        //console.log("result console : " + JSON.stringify(res));
        if(lv === "1" && loc === "top"){
          setSearchType({
            ...searchType
            , deptList: res.data.commcodeModel
          })
        }else if(lv === "2" && loc === "top"){
          setSearchDType({
            ...searchDType
            , deptList: res.data.commcodeModel
          })
        }else if(lv === "1" && loc === "table"){
          setSearchTableType({
            //...searchTableType
            //, 
            deptList: res.data.commcodeModel
          })
        }else if(lv === "2" && loc === "table"){
          setSearchTableDType({
            //...searchTableDType
            //, 
            deptList: res.data.commcodeModel
          })
        }
        /*
        setFilteredData({
          ...filteredData,
          empList: res.data.empInfolist,
          totalcnt: res.data.totalcnt
        });*/
      })
      .catch((err) => {
        console.log("list error");
        alert(err.message);
      });
  }, [searchType, searchTableType]);

  const searchlist = async () => {

    let params = new URLSearchParams();
    params.append("emp_name", filters.search);
    params.append("dept_cd", filters.type);
    params.append("pagesize", 100);
    params.append("cpage", 1);

    await axios
      .post("/emp/empInfolist", params)
      .then((res) => {
        //setTotalcnt(res.data.listcnt);
        //setNoticelist(res.data.listdata);
        //console.log("result console : " + res);
        /*console.log("result console : " + JSON.stringify(res));
        console.log(
          "result console : " +
            res.data.totalcnt +
            " : " +
            JSON.stringify(res.data.listdate) +
            " : " +
            JSON.stringify(res.status) +
            " : " +
            JSON.stringify(res.statusText)
        );*/
        setFilteredData({
          ...filteredData,
          empList: res.data.empInfolist,
          totalcnt: res.data.totalcnt
        });
      })
      .catch((err) => {
        console.log("list error");
        alert(err.message);
      });
      
  };
//최상위를 클릭하면 emp_no 위치에 최상위의 id값이 오게되고 하위 애들을 render에서 그림
//각각의 emp_no에 (사실은 dept_cd) ...prev로 기존값 가져와서 !prev로 부정함 그래서 false true 조작함
  const toggleRow = (emp_no) => {
    setExpandedRows((prev) => ({
      ...prev,
      [emp_no]: !prev[emp_no], 
    }));
  };

  //상단 조회조건
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log("handleInputChange");
    console.log("name ="+name);
    console.log("value ="+value);
    //부서대분류 변경시 중분류 변경
    if(name==="type"){
      searchTypeList(value,'2','top');
    }   
  };

  //테이블 로우 부서목록변경
  const handleRowInputChange = (e) => {
    const { name, value } = e.target;
    console.log('handleRowInputChange e.target')
    console.log(e.target)
    console.log("handleInputChange");
    console.log("name ="+name);
    console.log("value ="+value);
    //로우에서 수정시
    if(name==="rowType"){
      setSearchTableType((prev) => ({
        ...prev,
        [name]: value,
        //[empNo]: value,
      }));
      searchTypeList(value,'2','table');
    }
    
  };

  const formatDate = (reg_date) => {
    // 연도, 월, 일 부분을 슬라이싱
    const year = reg_date.slice(0, 4);  // 처음 4자리: 연도
    const month = reg_date.slice(4, 6); // 5~6번째 자리: 월
    const day = reg_date.slice(6, 8);   // 7~8번째 자리: 일

    // 원하는 포맷으로 결합
    return `${year}-${month}-${day}`;
  }

  //수정버튼 클릭이벤트 
  const modifyEmpInfo = (empInfo) => {
    console.log('modifyEmpInfo');
    console.log(empInfo);
    //여기서 현재를 제외한 모두를 false로 만드는방법이 뭘까
    setReadOnlyYn((prev) => ({
      ...prev,
      [empInfo.emp_no]: !prev[empInfo.emp_no],
    }));
    searchTypeList('','1','table', empInfo.emo);
    //searchTypeList(empInfo.up_dept_cd,'2','table');
  }
  //저장버튼
  const saveEmpInfo = (empInfo) => {


    //버튼 상태변경
    setReadOnlyYn((prev) => ({
      ...prev,
      [empInfo.empNo]: !prev[empInfo.empNo],
    }));
  }

  const handleSearch = () => {
    //const { search, type, date } = filters;
    console.log('pre list console');
    searchlist();
  };

  //table selectbox 목록세팅
  const makeDetail = (empInfo) => {
    console.log('makeDetail');
    console.log(empInfo);
  }

  const renderRows = (nodes, level = 0) => {

    return nodes.map((node) => (
     <React.Fragment key={node.emp_no}>
        <tr className="bg-white hover:bg-gray-50">
          <td className={`px-4 py-2 ${level > 0 ? `pl-${level * 6}` : ""}`}>
            {node.boardVoList && (
              <button
                onClick={() => toggleRow(node.dept_cd)}
                className="mr-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                {expandedRows[node.dept_cd] ? "▼" : "▶"}
              </button>
            )}
            {node.fraction_yn === 'N' ? 
            readOnlyYn[node.emp_no] ? 
            <>
            <select
              name="rowType"
              value={node.up_dept_cd}
              onChange={handleRowInputChange}
              className="w-full border border-gray-100 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-100"
            >
              {searchTableType.deptList.map((item, index) => (
                <option key={index} value={item.detail_code}>{item.detail_name}</option>
              ))
              }
            </select>
            {
              (()=>{
                //가져오는 list를 만들고 그 후에 해당 list를 이용해서 selectbox를 채우는형식으로 제작
                let list = makeDetail(node);
                console.log('list');
                console.log(list);
                return (
                  <select
                    name="rowDType"
                    value={node.dept_cd}
                    onChange={handleRowInputChange}
                    className="w-full border border-gray-100 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-100"
                  >
                    {searchTableDType.deptList.map((item, index) => (
                      <option key={index} value={item.detail_code}>{item.detail_name}</option>
                    ))
                    }
                  </select>
                )
                
              }
            )()
            }
            </>
            : node.dept_name
            : node.dept_name}
          </td>
          <td className="px-4 py-2 text-gray-700">{node.fraction_yn === 'N' ? node.emp_no : ''}</td>
          <td className="px-4 py-2 text-gray-700">
           {/* 이름변경위해 그냥 td에 html넣는 형태에서 input태그로 변경함 */}
           {node.fraction_yn === 'N' ? 
           <input 
              type="text"
              name="emp_name"
              className="border rounded px-2 py-1"
              value={node.emp_name}
              readOnly={readOnlyYn[node.emp_no] ? false : true}
            >
            </input> : ''}
          </td>
          <td className="px-4 py-2 text-gray-500">{node.fraction_yn === 'N' ? formatDate(node.reg_date) : ''}</td>
          <td className="px-4 py-2 text-gray-500">
            {/* 조회시 부서정보가 아닌 사원정보인경우 */}
            {node.fraction_yn === 'N' ? 
              readOnlyYn[node.emp_no] ? 
              
              <>
              <button
                className="btn btn-default mx-2"
                //버튼 click시 그냥 modifyEmpInfo(node.emp_no)만하면 오류남 ES6문법으로 해야됨
                onClick={() => saveEmpInfo(node)}
              > 저장
              </button> 
              <button
                className="btn btn-default mx-2"
                onClick={() => modifyEmpInfo(node)}
              > 취소
              </button> 
              </>
              : 
              <button
                className="btn btn-default mx-2"
                onClick={() => modifyEmpInfo(node)}
              > 수정
              </button>
              : ''}
              {/* 수정버튼 누르면 저장 취소버튼나오도록*/}
          </td>
        </tr>
        {node.boardVoList &&
          expandedRows[node.dept_cd] &&
          renderRows(node.boardVoList, level + 1)}
     </React.Fragment>
    ));
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">사원관리</h1>

      {/* 검색 조건 영역 */}
      <div className="bg-white p-4 shadow-md rounded-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">사원명</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">부서</label>
            <select
              name="type"
              value={searchType.deptList.detail_code}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              {/* searchType.deptList.map((item, index) => {} 로 하게되면 리턴하지못한다 => () 해야 리턴이된다 */}
              <option key="0" value="all">전체</option>
              {searchType.deptList.map((item, index) => (
                <option key={index} value={item.detail_code}>{item.detail_name}</option>
              ))
              }
              
            </select>
            <select
              name="dType"
              value={searchDType.deptList.detail_code}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option key="0" value="all">전체</option>
              {searchDType.deptList.map((item, index) => (
                <option key={index} value={item.detail_code}>{item.detail_name}</option>
              ))
              }
              
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Filter by Date:</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left text-gray-700">부서명</th>
              <th className="px-4 py-2 text-left text-gray-700">사원번호</th>
              <th className="px-4 py-2 text-left text-gray-700">이름</th>
              <th className="px-4 py-2 text-left text-gray-500">등록일</th>
              <th className="px-4 py-2 text-left text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.empList.length > 0 ? (
              renderRows(filteredData.empList)
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TreeTable;
/*
export default function App() {

  
  const sampleData2 = [
    {
      id: 1,
      name: "Root 1",
      type: "Folder",
      updatedAt: "2025-01-16",
      children: [
        {
          id: 2,
          name: "Child 1.1",
          type: "File",
          updatedAt: "2025-01-15",
        },
        {
          id: 3,
          name: "Child 1.2",
          type: "Folder",
          updatedAt: "2025-01-14",
          children: [
            {
              id: 4,
              name: "Child 1.2.1",
              type: "File",
              updatedAt: "2025-01-13",
            },
          ],
        },
      ],
    },
    {
      id: 5,
      name: "Root 2",
      type: "File",
      updatedAt: "2025-01-12",
    },
  ];

  return <TreeTable data={sampleData} />;
}
*/