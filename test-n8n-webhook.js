const fetch = require('node:fetch');

const testData = [
  {
    "personId": "1716e5d0-285f-40bd-bf98-bb09d746a2d6",
    "userId": "user_2ziA1VOdDLAhiV1V8wkbgwgBJ7a",
    "language": "zh",
    "Overall Structure": "此命身弱，以水火为用神，日主坐申金透出，金水交战，需木火来制金及滋水，达到体用平衡。十神关系复杂，财星火旺，官星土藏但不显，印星木为喜用，印比辅助日主。身弱需外助，事业主软硬结合。",
    "5 Element": "{\"wood\":3,\"fire\":4,\"earth\":2,\"metal\":4,\"water\":3}",
    "Energy Chart": "木: ###\n火: ####\n土: ##\n金: ####\n水: ###\n整体金木水火较均衡，土较弱",
    "Major Luck Cycles": "{\"current\":{\"age\":\"42-51岁\",\"element\":\"土\",\"description\":\"当前大运为戊戌土运，土生金，支持事业稳定，适宜发展实体和服务业。\"},\"cycles\":[{\"age\":\"12-21岁\",\"element\":\"火\",\"description\":\"青少年火运，学习转折期与人际挑战并存，火生土助身弱。\"},{\"age\":\"22-31岁\",\"element\":\"土\",\"description\":\"成人早期土运，加强财运与稳定性，经历软件行业困难。\"},{\"age\":\"32-41岁\",\"element\":\"金\",\"description\":\"金运助力金水调和，事业科技行业压力增大，需注意健康。\"},{\"age\":\"42-51岁\",\"element\":\"土\",\"description\":\"当前土运稳中趋进，适合实体投资与服务业拓展。\"}]}",
    "Career Direction": "{\"suitable\":[\"软件服务\",\"饮品零售\",\"黄金当铺\"],\"unsuitable\":[\"高风险投机\",\"重体力劳动\",\"长时间单调重复工作\"]}",
    "Risk Periods": "{\"major\":[\"1992-1995童年校园欺凌\",\"2008-2012软件行业压力大\",\"2024-2025家中长辈逝世和创业压力\"],\"secondary\":[\"1999-2000学业转折\",\"2017结婚调整期\"],\"risk_type\":[\"情绪波动\",\"事业挫折\",\"家庭变动\"]}",
    "Future 5": "{\"wealth\":\"财运稳健，饮品业务和软件服务均有增长潜力。\",\"career\":\"事业稳定中有创新机会，新公司有望带来突破。\",\"relationship\":\"婚姻稳固，家庭氛围和谐，适合增加亲子交流。\",\"health\":\"整体良好，注意饮食与精神压力管理。\"}",
    "Future 10": "{\"wealth\":\"财富积累明显，适合多元投资。\",\"career\":\"事业迈入稳定上升期，技术和管理能力提升至关重要。\",\"relationship\":\"感情稳定，但需继续经营夫妻关系，避免沟通误会。\",\"health\":\"健康状况总体良好，需防慢性病发生，适度运动。\"}",
    "SelectedTopic": "婚姻方面，此命婚后运势较好，夫妻感情稳定且互补，土的稳重与火的热情结合，使家庭生活温馨和谐。婚姻中应注意沟通和理解，避免因工作忙碌导致忽略关系维护。伴随子女出生，家庭关系更加稳固，支持事业发展。",
    "Question": "教育方面，此命木火旺，适合文理兼修，偏重理科与实践结合，适合技术、软件相关学习以及管理类进修。学业转折期多源于调整学习方法和人际环境，需培养自律和抗压能力。建议持续学习新技术，拓展视野，有助于事业与个人成长。"
  }
];

async function testWebhook() {
  console.log('Testing n8n webhook with actual data...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/n8n/personal-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-secret': process.env.N8N_CALLBACK_SHARED_SECRET || 'test-secret'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
    if (result.success && result.analysis) {
      console.log('\n✅ Success!');
      console.log('Selected Topic:', result.analysis.selected_topic ? result.analysis.selected_topic.substring(0, 50) + '...' : 'NULL');
      console.log('Question:', result.analysis.question ? result.analysis.question.substring(0, 50) + '...' : 'NULL');
      console.log('Overall Structure:', result.analysis.overall_structure ? result.analysis.overall_structure.substring(0, 50) + '...' : 'NULL');
    } else {
      console.log('\n❌ Failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWebhook();
