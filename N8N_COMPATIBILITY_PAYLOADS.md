# n8n Compatibility Analysis Payloads

This document provides example payloads for all compatibility analysis types that n8n should send to the `/api/n8n/love-analysis` endpoint.

---

## 🔐 Required Headers

```
x-n8n-secret: your-shared-secret-from-env
Content-Type: application/json
```

---

## 📋 Common Fields (All Types)

These fields should be included in **all** compatibility analysis types:

```json
{
  "compatibilityId": "uuid-from-initial-request",
  "userId": "user_clerk_id",
  "personId": "uuid-of-person",
  "personA": {
    "name": "Person A Name",
    "birthdate": "dd/mm/yyyy"
  },
  "personB": {
    "name": "Person B Name", 
    "birthdate": "dd/mm/yyyy"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "longTermOutlook": "Long-term outlook description",
  "advice": "Advice for the relationship/partnership",
  "SelectedTopic": "Topic name in analysis language",
  "Question": "Original question asked"
}
```

---

## ❤️ Love & Romance Analysis

**Type:** `love`

**Endpoint:** `POST /api/n8n/love-analysis`

**Payload:**

```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": {
    "name": "Tang Shang Wey",
    "birthdate": "02/09/1980"
  },
  "personB": {
    "name": "Ng Lee Peng",
    "birthdate": "15/03/1985"
  },
  "relationshipDynamics": {
    "emotionalCompatibility": "情感连接深厚，双方能够理解彼此的情绪需求。",
    "communicationStyle": "沟通方式互补，一方善于表达，另一方善于倾听。",
    "mutualSupport": "相互支持力度强，能够在困难时期互相扶持。"
  },
  "marriagePotential": {
    "overallScore": 85,
    "stability": "关系稳定性高，双方都有长期承诺的意愿。",
    "commitmentLevel": "承诺水平一致，都希望建立稳定的婚姻关系。",
    "timingForMarriage": "时机成熟，建议在未来1-2年内考虑结婚。"
  },
  "strengths": [
    "情感连接深厚，相互理解",
    "价值观一致，目标相同",
    "沟通顺畅，能够有效解决冲突",
    "相互支持，共同成长",
    "家庭观念相似，对未来有共同规划"
  ],
  "challenges": [
    "生活习惯差异需要磨合",
    "财务管理方式不同，需要协调",
    "家庭背景差异可能带来压力"
  ],
  "longTermOutlook": "长期关系前景良好，只要保持沟通和相互尊重，婚姻将会幸福稳定。",
  "advice": "建议加强财务沟通，建立共同的理财计划。同时，尊重彼此的生活习惯，寻找平衡点。",
  "SelectedTopic": "爱情婚姻匹配分析",
  "Question": "请从婚姻角度分析两位个体的匹配度与长期关系潜力。"
}
```

---

## 💼 Business Partnership Analysis

**Type:** `business`

**Endpoint:** `POST /api/n8n/love-analysis`

**Payload:**

```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": {
    "name": "Tang Shang Wey",
    "birthdate": "02/09/1980"
  },
  "personB": {
    "name": "Ng Lee Peng",
    "birthdate": "15/03/1985"
  },
  "partnershipPotential": {
    "overallScore": 78,
    "financialSynergy": "财务协同表现良好，结合了稳健与创新，使资源运用更为高效。",
    "conflictManagement": "需注意沟通风格差异，通过定期沟通和明确分工减少冲突。",
    "longTermViability": "长期合作潜力积极，只要保持角色清晰和相互尊重。"
  },
  "strengths": [
    "分析能力强且注重细节的领导力",
    "风险承受与投资风格互补",
    "理财意识强，注重财务健康",
    "决策方式平衡，兼具理性与直觉",
    "基于强项建立的互信潜力"
  ],
  "risks": [
    "沟通风格差异可能导致误解",
    "风险承受能力不同需协调",
    "若角色未明确可能产生权力重叠"
  ],
  "recommendedStructure": "建议明确角色分工，由A负责规划和风险控制，B主攻创新与业务拓展，以发挥互补优势。",
  "longTermOutlook": "只要保持沟通畅通及角色明确，合作前景看好，发展稳定。",
  "advice": "定期沟通与信息透明，发挥双方优势，明确责任分工，最大化合作潜力。",
  "SelectedTopic": "商业合伙人匹配分析",
  "Question": "请从商业合作角度分析两位个体的合作潜力与风险。"
}
```

---

## 👥 Team/Work Compatibility Analysis

**Type:** `work`

**Endpoint:** `POST /api/n8n/love-analysis`

**Payload:**

```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": {
    "name": "Tang Shang Wey",
    "birthdate": "02/09/1980"
  },
  "personB": {
    "name": "Ng Lee Peng",
    "birthdate": "15/03/1985"
  },
  "teamDynamics": {
    "overallScore": 82,
    "workStyleCompatibility": "工作风格互补，一方注重细节，另一方擅长大局观。",
    "communicationEffectiveness": "团队沟通效率高，能够快速达成共识。",
    "conflictResolution": "冲突解决能力强，能够理性处理分歧。"
  },
  "collaborationStyle": {
    "taskAllocation": "任务分配合理，能够根据各自优势分工。",
    "decisionMaking": "决策过程民主，双方都能参与重要决定。",
    "feedbackCulture": "反馈文化良好，能够坦诚交流意见。"
  },
  "strengths": [
    "技能互补，覆盖面广",
    "工作效率高，执行力强",
    "相互信任，团队凝聚力好",
    "创新能力强，能够应对挑战",
    "学习能力强，共同进步"
  ],
  "risks": [
    "工作节奏差异可能导致摩擦",
    "责任边界需要明确界定",
    "压力管理方式不同需要协调"
  ],
  "longTermOutlook": "团队合作前景良好，能够长期保持高效协作。",
  "advice": "建议定期团队建设活动，加强非工作层面的交流。明确各自职责范围，避免重复劳动。",
  "SelectedTopic": "团队协作匹配分析",
  "Question": "请从团队合作角度分析两位个体的协作潜力。"
}
```

---

## 🏠 Family Harmony Analysis

**Type:** `family`

**Endpoint:** `POST /api/n8n/love-analysis`

**Payload:**

```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": {
    "name": "Tang Shang Wey",
    "birthdate": "02/09/1980"
  },
  "personB": {
    "name": "Ng Lee Peng",
    "birthdate": "15/03/1985"
  },
  "familyHarmony": {
    "overallScore": 88,
    "emotionalBonding": "情感纽带深厚，家庭成员之间关系融洽。",
    "communicationPattern": "沟通模式健康，能够开放表达情感和需求。",
    "supportSystem": "相互支持系统完善，能够在困难时期互相帮助。"
  },
  "generationalDynamics": {
    "respectLevel": "代际尊重程度高，能够理解不同年龄段的观点。",
    "traditionVsModern": "传统与现代价值观平衡良好。",
    "roleClarity": "家庭角色清晰，各自职责明确。"
  },
  "strengths": [
    "家庭凝聚力强，成员关系和谐",
    "相互尊重，能够包容差异",
    "沟通开放，问题能够及时解决",
    "共同价值观，家庭目标一致",
    "情感支持充足，归属感强"
  ],
  "risks": [
    "代际观念差异需要持续沟通",
    "生活习惯不同需要相互适应",
    "期望值差异可能导致失望"
  ],
  "longTermOutlook": "家庭关系长期稳定，能够共同面对生活挑战。",
  "advice": "建议定期家庭聚会，增进感情交流。尊重彼此的生活方式，寻找共同兴趣爱好。",
  "SelectedTopic": "家庭和谐度分析",
  "Question": "请从家庭关系角度分析两位个体的相处模式与和谐度。"
}
```

---

## ⭐ Friendship Compatibility Analysis

**Type:** `friend`

**Endpoint:** `POST /api/n8n/love-analysis`

**Payload:**

```json
{
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "personId": "uuid",
  "personA": {
    "name": "Tang Shang Wey",
    "birthdate": "02/09/1980"
  },
  "personB": {
    "name": "Ng Lee Peng",
    "birthdate": "15/03/1985"
  },
  "friendshipCompatibility": {
    "overallScore": 90,
    "trustLevel": "信任度高，能够分享私密话题。",
    "sharedInterests": "共同兴趣广泛，有很多话题可以交流。",
    "emotionalSupport": "情感支持充足，能够在需要时互相帮助。"
  },
  "socialDynamics": {
    "socialCircleOverlap": "社交圈重叠度适中，既有共同朋友又保持独立性。",
    "activityCompatibility": "活动偏好相似，喜欢一起参加各种活动。",
    "boundaryRespect": "边界尊重良好，能够给予彼此空间。"
  },
  "strengths": [
    "价值观相似，容易产生共鸣",
    "性格互补，相处愉快",
    "相互信任，友谊深厚",
    "支持彼此成长，共同进步",
    "幽默感相投，相处轻松"
  ],
  "risks": [
    "时间分配需要平衡，避免忽视其他关系",
    "意见分歧时需要妥善处理",
    "生活阶段变化可能影响友谊"
  ],
  "longTermOutlook": "友谊长期稳定，能够成为终身好友。",
  "advice": "建议保持定期联系，即使生活忙碌也要抽时间见面。尊重彼此的生活选择，支持而不干涉。",
  "SelectedTopic": "友谊匹配度分析",
  "Question": "请从友谊角度分析两位个体的相处模式与友谊深度。"
}
```

---

## 🔄 Data Flow Summary

### 1. Frontend Triggers Analysis

```javascript
POST /api/compatibility/analyze
{
  "personAId": "uuid",
  "personBId": "uuid",
  "language": "zh",
  "analysisType": "business"  // or love, work, family, friend
}
```

### 2. Backend Creates Record & Calls n8n

```javascript
// Creates pending record in database
INSERT INTO compatibility_analyses (compatibilityId, ...)

// Sends to n8n webhook
POST https://your-n8n.com/webhook/compatibility
{
  "type": "business",
  "compatibilityId": "uuid",
  "userId": "user_xxx",
  "language": "zh",
  "personA": { ... },
  "personB": { ... }
}
```

### 3. n8n Processes & Returns Results

```javascript
POST /api/n8n/love-analysis
Headers: x-n8n-secret: your-secret
{
  // Use appropriate payload structure based on type
  // See examples above for each type
}
```

### 4. Backend Updates Database

```javascript
UPDATE compatibility_analyses 
SET result_data = $1::jsonb
WHERE id = compatibilityId
```

---

## 📊 Score Field Mapping

The frontend extracts the overall score from different fields based on analysis type:

| Type | Score Field Path |
|------|------------------|
| Love | `marriagePotential.overallScore` |
| Business | `partnershipPotential.overallScore` |
| Work | `teamDynamics.overallScore` |
| Family | `familyHarmony.overallScore` |
| Friend | `friendshipCompatibility.overallScore` |

---

## ✅ Validation Checklist

Before sending payload to `/api/n8n/love-analysis`:

- [ ] Include `x-n8n-secret` header
- [ ] Include `compatibilityId` (from initial request)
- [ ] Include `userId` and `personId`
- [ ] Include `personA` and `personB` objects
- [ ] Include type-specific score object (marriagePotential, partnershipPotential, etc.)
- [ ] Include `strengths` array
- [ ] Include `longTermOutlook` string
- [ ] Include `advice` string
- [ ] Include `SelectedTopic` and `Question`

---

## 🐛 Common Issues

### Issue: "Missing required field: compatibilityId"
**Solution:** Ensure n8n includes the `compatibilityId` from the initial webhook trigger in the response.

### Issue: Score not displaying
**Solution:** Ensure the score is in the correct nested object for the analysis type (e.g., `partnershipPotential.overallScore` for business).

### Issue: Data not saving
**Solution:** Check that the `x-n8n-secret` header matches the environment variable.

---

## 📝 Notes

- All payloads go to the **same endpoint**: `/api/n8n/love-analysis`
- The endpoint automatically handles all types based on the data structure
- JSONB storage allows flexible field structures per type
- Frontend determines display based on `analysis_type` in database
