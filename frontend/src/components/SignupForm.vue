<script setup lang="ts">
import { ref } from "vue"
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

import { storeToRefs } from 'pinia'
import { useauthStore } from '@/stores/authStore'

const store = useauthStore()
const { Name, email, password, registerError } = storeToRefs(store)

const showPassword = ref(false)
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')

//validate here rather than with the native `required` attribute, so the browser's
//own tooltip doesn't fire first and hide our own messages
const validate = () => {
    nameError.value = ''
    emailError.value = ''
    passwordError.value = ''

    if (!Name.value || !String(Name.value).trim()) {
        nameError.value = 'Name is required'
    }

    if (!email.value || !String(email.value).trim()) {
        emailError.value = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(String(email.value))) {
        emailError.value = 'Enter a valid email address'
    }

    if (!password.value) {
        passwordError.value = 'Password is required'
    } else if (String(password.value).length < 8) {
        //same rule the backend enforces
        passwordError.value = 'Password must be at least 8 characters'
    }

    return !nameError.value && !emailError.value && !passwordError.value
}

const submit = async () => {
    registerError.value = ''
    if (!validate()) return

    await store.register()

    //"Email already exists" is the one server error we can pin to a field,
    //so show it there instead of in the form-level banner
    if (registerError.value && /already exists/i.test(registerError.value)) {
        emailError.value = registerError.value
        registerError.value = ''
    }
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="font-bold text-lg">Create your account</CardTitle>
            <CardDescription>
                Enter your information below to create your account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="submit" novalidate>
                <FieldGroup>
                    <!-- server-side failure that isn't tied to one field -->
                    <p v-if="registerError"
                        class="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm font-medium">
                        {{ registerError }}
                    </p>

                    <Field>
                        <FieldLabel for="name">
                            Name
                        </FieldLabel>
                        <p v-if="nameError" class="text-destructive text-sm font-medium">
                            {{ nameError }}
                        </p>
                        <Input id="name" v-model="Name" type="text" :aria-invalid="!!nameError"
                            :class="nameError ? 'border-destructive focus-visible:ring-destructive/30' : ''" />
                    </Field>

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
                        <FieldLabel for="password">
                            Password
                        </FieldLabel>
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
                        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                    </Field>

                    <FieldGroup>
                        <Field>
                            <Button type="submit">
                                Create Account
                            </Button>

                            <FieldDescription class="px-6 text-center">
                                Already have an account?
                                <RouterLink to="/login">Sign in</RouterLink>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
</template>
