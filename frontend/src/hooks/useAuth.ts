import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { typedApi, type User } from "../api/typed-api";
import { setAuthenticationState } from "../api/typed-api";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => typedApi.auth.login({ username, password }),
    onSuccess: async () => {
      setAuthenticationState(true);

      // Wait a moment for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch user data immediately after login
      try {
        const user = await typedApi.auth.getMe();
        queryClient.setQueryData(["user"], user);
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        // Force retry the user query
        queryClient.refetchQueries({ queryKey: ["user"] });
      }
    },
    onError: () => {
      setAuthenticationState(false);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName?: string;
    }) =>
      typedApi.auth.register({
        email,
        password,
        full_name: fullName,
      }),
    onSuccess: (user: User) => {
      queryClient.setQueryData(["user"], user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => typedApi.auth.getMe(),
    enabled: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: 1000,
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => typedApi.auth.refresh(),
    onSuccess: () => {
      setAuthenticationState(true);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      setAuthenticationState(false);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => typedApi.auth.logout(),
    onSuccess: () => {
      setAuthenticationState(false);
      queryClient.clear();
      // Redirect to auth page
      window.location.href = "/auth";
    },
    onError: () => {
      // Even if logout fails on the server, clear local state
      setAuthenticationState(false);
      queryClient.clear();
      window.location.href = "/auth";
    },
  });
};
