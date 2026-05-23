package com.library.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String nickname;
    private List<String> roles;
    private List<MenuDTO> menus;
}
