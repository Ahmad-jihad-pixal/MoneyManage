<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "@lucide/vue"

const props = defineProps<{
    class?: HTMLAttributes["class"]
}>()

import { storeToRefs } from 'pinia'
import { useauthStore } from '@/stores/authStore'

const store = useauthStore()
const { email, password, loginError } = storeToRefs(store)

const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

//validate here rather than with the native `required` attribute, so the browser's
//own tooltip doesn't fire first and hide our own messages
const validate = () => {
    emailError.value = ''
    passwordError.value = ''

    if (!email.value || !String(email.value).trim()) {
        emailError.value = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(String(email.value))) {
        emailError.value = 'Enter a valid email address'
    }

    if (!password.value) {
        passwordError.value = 'Password is required'
    }

    return !emailError.value && !passwordError.value
}

const submit = async () => {
    loginError.value = ''
    if (!validate()) return
    await store.login()
}
</script>

<template>
    <div :class="cn('flex flex-col gap-6', props.class)">
        <Card>
            <CardHeader>
                <CardTitle class="font-bold text-lg">Log in </CardTitle>
                <CardDescription>

                    Enter your email and password to continue.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit.prevent="submit" novalidate>
                    <FieldGroup>
                        <!-- server-side failure (e.g. wrong credentials) — it isn't tied to
                             one field, so it sits at the top of the form -->
                        <p v-if="loginError"
                            class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm font-medium">
                            {{ loginError }}
                        </p>

                        <Field>
                            <FieldLabel for="email">
                                Email
                            </FieldLabel>
                            <p v-if="emailError" class="text-destructive text-sm font-medium">
                                {{ emailError }}
                            </p>
                            <Input id="email" v-model="email" type="email" placeholder="m@example.com"
                                :aria-invalid="!!emailError"
                                :class="emailError ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
                        </Field>

                        <Field>
                            <div class="flex items-center">
                                <FieldLabel for="password">
                                    Password
                                </FieldLabel>

                            </div>
                            <p v-if="passwordError" class="text-destructive text-sm font-medium">
                                {{ passwordError }}
                            </p>
                            <div class="relative">
                                <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                    class="pr-10" :aria-invalid="!!passwordError"
                                    :class="passwordError ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
                                    :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                    <EyeOff v-if="showPassword" class="size-4" />
                                    <Eye v-else class="size-4" />
                                </button>
                            </div>
                        </Field>

                        <Field>
                            <Button type="submit">
                                Login
                            </Button>

                            <FieldDescription class="text-center">
                                Don't have an account?
                                <RouterLink to="/signup">
                                    Sign up
                                </RouterLink>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
