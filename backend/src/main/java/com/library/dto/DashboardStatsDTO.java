package com.library.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long bookCount;
    private long userCount;
    private long roleCount;
    private Map<String, Object> borrowSummary;
    private List<Map<String, Object>> categoryStats;
}
